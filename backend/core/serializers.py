from rest_framework import serializers
from .models import UploadBatch, ChemicalEquipment

class ChemicalEquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChemicalEquipment
        fields = '__all__'

class UploadBatchSerializer(serializers.ModelSerializer):
    # This nested serializer allows us to see the equipment data inside the batch response if needed
    equipments = ChemicalEquipmentSerializer(many=True, read_only=True)

    class Meta:
        model = UploadBatch
        fields = ['id', 'file', 'uploaded_at', 'equipments']