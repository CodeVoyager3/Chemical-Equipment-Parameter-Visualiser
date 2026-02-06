from django.urls import path
from .views import FileUploadView, generate_pdf, BatchAnalysisView
from .auth_views import RegisterView, LoginView

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('export-pdf/<int:batch_id>/', generate_pdf, name='export-pdf'),
    path('batch/<int:batch_id>/', BatchAnalysisView.as_view(), name='batch-analysis'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
]