from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QHBoxLayout, QVBoxLayout, 
    QStackedWidget, QLabel, QFrame, QPushButton
)
from PyQt5.QtCore import Qt
from theme import Theme
from ui.dashboard import Dashboard
from ui.components import SidebarButton

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Chemical Visualizer - Desktop")
        self.resize(1200, 800)
        
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
        
        self.view_dashboard = Dashboard()
        self.content_layout.addWidget(self.view_dashboard)
        
        self.main_layout.addWidget(self.content_area)
