from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
import pandas as pd
from .models import UploadBatch, ChemicalEquipment
from .serializers import UploadBatchSerializer

class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

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