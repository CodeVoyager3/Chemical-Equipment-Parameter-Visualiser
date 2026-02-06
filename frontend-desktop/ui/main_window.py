from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QHBoxLayout, QVBoxLayout, 
    QStackedWidget, QLabel, QFrame, QPushButton, QMessageBox
)
from PyQt5.QtCore import Qt
from theme import Theme
from ui.dashboard import Dashboard
from ui.components import SidebarButton
from ui.login_dialog import LoginDialog
from api_client import APIClient

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Chemical Visualizer - Desktop")
        self.resize(1200, 800)
        
        # Initialize API client
        self.api_client = APIClient()
        
        # Central Widget
        self.central_widget = QWidget()
        self.central_widget.setObjectName("MainContainer")
        self.setCentralWidget(self.central_widget)
        
        # Main Layout - Pure Vertical, no sidebar
        self.main_layout = QVBoxLayout(self.central_widget)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.setSpacing(0)
        
        # 2. Main Content Area
        self.content_area = QWidget()
        self.content_area.setObjectName("ContentArea")
        self.content_layout = QVBoxLayout(self.content_area)
        self.content_layout.setContentsMargins(0, 0, 0, 0)
        
        # Dashboard will be created after login
        self.view_dashboard = None
        
        self.main_layout.addWidget(self.content_area)
        
    def showEvent(self, event):
        """Override show event to display login dialog first."""
        super().showEvent(event)
        
        # Only show login dialog on first show
        if not hasattr(self, '_login_shown'):
            self._login_shown = True
            # Use a single-shot timer to show dialog after window is visible
            from PyQt5.QtCore import QTimer
            QTimer.singleShot(100, self.show_login_dialog)
    
    def show_login_dialog(self):
        """Display login dialog and initialize dashboard on success."""
        login_dialog = LoginDialog(self.api_client, self)
        result = login_dialog.exec_()
        
        if result == LoginDialog.Accepted and login_dialog.authenticated:
            # Login successful - create and show dashboard
            self.view_dashboard = Dashboard(api_client=self.api_client)
            self.content_layout.addWidget(self.view_dashboard)
        else:
            # Login cancelled or failed - close the application
            QMessageBox.information(
                self, 
                "Login Required", 
                "Authentication is required to use this application."
            )
            self.close()

