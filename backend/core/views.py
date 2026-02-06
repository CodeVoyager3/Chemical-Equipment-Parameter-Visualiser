from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
import pandas as pd
from .models import UploadBatch, ChemicalEquipment
from .serializers import UploadBatchSerializer
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER

class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    # Uses global REST_FRAMEWORK settings: BasicAuthentication + IsAuthenticated

    def post(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        
        if not file_obj:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Create the Batch entry
        batch = UploadBatch.objects.create(file=file_obj)

        try:
            # 2. Read CSV using Pandas
            df = pd.read_csv(batch.file.path)

            # Basic Validation: Check if required columns exist
            required_columns = ['Equipment Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']
            if not all(col in df.columns for col in required_columns):
                batch.delete() # Clean up bad upload
                return Response({"error": f"Missing columns. Required: {required_columns}"}, status=status.HTTP_400_BAD_REQUEST)

            # 3. Process Data & Save to DB
            equipment_list = []
            for _, row in df.iterrows():
                equipment_list.append(ChemicalEquipment(
                    batch=batch,
                    equipment_name=row['Equipment Name'],
                    equipment_type=row['Type'],
                    flowrate=row['Flowrate'],
                    pressure=row['Pressure'],
                    temperature=row['Temperature']
                ))
            
            # Bulk create is much faster than saving one by one
            ChemicalEquipment.objects.bulk_create(equipment_list)

            # 4. Calculate Statistics (The "Analytics" part)
            stats = {
                "total_count": len(df),
                "average_flowrate": round(df['Flowrate'].mean(), 2),
                "average_pressure": round(df['Pressure'].mean(), 2),
                "average_temperature": round(df['Temperature'].mean(), 2),
                # This counts how many of each Type exist (e.g., {"Pump": 10, "Valve": 5})
                "type_distribution": df['Type'].value_counts().to_dict()
            }

            # 5. History Management: Keep only last 5 uploads
            # Get IDs of all batches, ordered by newest first
            all_batches = UploadBatch.objects.order_by('-uploaded_at')
            if all_batches.count() > 5:
                # Identify the ones to delete (everything after the 5th one)
                ids_to_delete = all_batches.values_list('id', flat=True)[5:]
                UploadBatch.objects.filter(id__in=ids_to_delete).delete()

            # 6. Return the analysis
            return Response({
                "message": "File processed successfully",
                "batch_id": batch.id,
                "statistics": stats
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            batch.delete() # Clean up if something crashes
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, *args, **kwargs):
        # Fetch the last 5 batches
        recent_batches = UploadBatch.objects.order_by('-uploaded_at')[:5]
        
        data = []
        for batch in recent_batches:
            data.append({
                "id": batch.id,
                "filename": batch.file.name.split('/')[-1], # Clean filename
                "uploaded_at": batch.uploaded_at,
                "equipment_count": batch.equipments.count()
            })
            
        return Response(data, status=status.HTTP_200_OK)

class BatchAnalysisView(APIView):
    def get(self, request, batch_id):
        try:
            batch = UploadBatch.objects.get(id=batch_id)
            
            # Recalculate or retrieve stats (for now, let's recalculate simply as we don't store stats in DB yet)
            # In a production app, you'd store stats in a JSONField or similar
            
            equipments = batch.equipments.all()
            total_count = equipments.count()
            
            if total_count == 0:
                 return Response({"error": "Batch is empty"}, status=status.HTTP_404_NOT_FOUND)
            
            # Simple aggregations
            # Note: For large datasets, doing this in Python is slow. 
            # Better to use Django aggregates: .aggregate(Avg('flowrate'), ...)
            
            from django.db.models import Avg
            
            aggregates = equipments.aggregate(
                avg_flow=Avg('flowrate'),
                avg_pressure=Avg('pressure'),
                avg_temp=Avg('temperature')
            )
            
            type_counts = {}
            for e in equipments:
                type_counts[e.equipment_type] = type_counts.get(e.equipment_type, 0) + 1
            
            stats = {
                "total_count": total_count,
                "average_flowrate": round(aggregates['avg_flow'] or 0, 2),
                "average_pressure": round(aggregates['avg_pressure'] or 0, 2),
                "average_temperature": round(aggregates['avg_temp'] or 0, 2),
                "type_distribution": type_counts
            }
            
            return Response({
                "batch_id": batch.id,
                "statistics": stats,
                "created_at": batch.uploaded_at
            }, status=status.HTTP_200_OK)
            
        except UploadBatch.DoesNotExist:
            return Response({"error": "Batch not found"}, status=status.HTTP_404_NOT_FOUND)

def generate_pdf(request, batch_id):
    try:
        batch = UploadBatch.objects.get(id=batch_id)
        equipments = batch.equipments.all()
        
        # Create the HttpResponse object with PDF headers
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="batch_{batch_id}_report.pdf"'

        # Create the PDF document
        doc = SimpleDocTemplate(response, pagesize=letter,
                                rightMargin=72, leftMargin=72,
                                topMargin=72, bottomMargin=18)
        
        # Container for PDF elements
        elements = []
        
        # Styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=12,
            alignment=TA_CENTER
        )
        
        # Title
        title = Paragraph(f"Chemical Equipment Analytics Report", title_style)
        elements.append(title)
        
        subtitle = Paragraph(
            f"<b>Batch ID:</b> {batch_id} | <b>Generated:</b> {batch.uploaded_at.strftime('%Y-%m-%d %H:%M')}",
            styles['Normal']
        )
        elements.append(subtitle)
        elements.append(Spacer(1, 0.3*inch))
        
        # Calculate statistics
        from django.db.models import Avg
        total = equipments.count()
        aggregates = equipments.aggregate(
            avg_flow=Avg('flowrate'),
            avg_pressure=Avg('pressure'),
            avg_temp=Avg('temperature')
        )
        
        # Summary Statistics Table
        summary_data = [
            ['Metric', 'Value'],
            ['Total Equipment', str(total)],
            ['Average Flowrate', f"{round(aggregates['avg_flow'] or 0, 2)} m³/hr"],
            ['Average Pressure', f"{round(aggregates['avg_pressure'] or 0, 2)} Pa"],
            ['Average Temperature', f"{round(aggregates['avg_temp'] or 0, 2)} °C"],
        ]
        
        summary_table = Table(summary_data, colWidths=[3*inch, 3*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#72e3ad')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 0.4*inch))
        
        # Equipment List Section
        equipment_header = Paragraph("<b>Equipment Details</b>", styles['Heading2'])
        elements.append(equipment_header)
        elements.append(Spacer(1, 0.2*inch))
        
        # Limit to first 100 items
        equipment_limit = 100
        limited_equipments = equipments[:equipment_limit]
        
        # Equipment Table
        equipment_data = [['Name', 'Type', 'Flowrate', 'Pressure', 'Temperature']]
        
        for eq in limited_equipments:
            equipment_data.append([
                eq.equipment_name,
                eq.equipment_type,
                f"{eq.flowrate}",
                f"{eq.pressure}",
                f"{eq.temperature}"
            ])
        
        equipment_table = Table(equipment_data, colWidths=[1.8*inch, 1.2*inch, 1*inch, 1*inch, 1*inch])
        equipment_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (1, -1), 'LEFT'),  # Name and Type left-aligned
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),  # Numbers right-aligned
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
        ]))
        
        elements.append(equipment_table)
        
        # Add note if data was limited
        if total > equipment_limit:
            elements.append(Spacer(1, 0.2*inch))
            note = Paragraph(
                f"<i>Note: Showing first {equipment_limit} of {total} total equipment items.</i>",
                styles['Normal']
            )
            elements.append(note)
        
        # Build PDF
        doc.build(elements)
        return response
        
    except UploadBatch.DoesNotExist:
        return HttpResponse("Batch not found", status=404)