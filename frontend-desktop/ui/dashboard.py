from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QGridLayout, QLabel, QFrame, 
    QSizePolicy, QFileDialog, QMessageBox, QScrollArea
)
from PyQt5.QtCore import Qt, QSize
from PyQt5.QtGui import QColor, QFont

import matplotlib
matplotlib.use('Qt5Agg')
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
import numpy as np

from theme import Theme
from ui.components import Card, ModernButton
from api_client import APIClient

class MplCanvas(FigureCanvas):
    def __init__(self, parent=None, width=5, height=4, dpi=100):
        self.fig = Figure(figsize=(width, height), dpi=dpi)
        self.axes = self.fig.add_subplot(111)
        
        # Apply Theme
        self.apply_theme()

        super(MplCanvas, self).__init__(self.fig)
        self.setParent(parent)
        
        SizePolicy = QSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.setSizePolicy(SizePolicy)

    def apply_theme(self):
        self.fig.patch.set_facecolor(Theme.CARD)
        self.axes.set_facecolor(Theme.CARD)
        
        self.axes.tick_params(colors=Theme.FOREGROUND, which='both')
        for spine in self.axes.spines.values():
            spine.set_edgecolor(Theme.BORDER)
            
        self.axes.xaxis.label.set_color(Theme.FOREGROUND)
        self.axes.yaxis.label.set_color(Theme.FOREGROUND)
        self.axes.title.set_color(Theme.FOREGROUND)

class Dashboard(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.api_client = APIClient()
        self.stats = None
        
        # Main Layout (Scrollable)
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)
        
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setFrameShape(QFrame.NoFrame)
        self.scroll_area.setStyleSheet("background-color: transparent;")
        
        self.content_widget = QWidget()
        self.content_widget.setStyleSheet(f"background-color: {Theme.BACKGROUND};")
        self.layout = QVBoxLayout(self.content_widget)
        self.layout.setContentsMargins(30, 30, 30, 30)
        self.layout.setSpacing(25)
        
        self.setup_hero_section()
        self.setup_upload_section()
        self.setup_stats_section()
        self.setup_charts_section()
        
        self.layout.addStretch()
        self.scroll_area.setWidget(self.content_widget)
        main_layout.addWidget(self.scroll_area)

    def setup_hero_section(self):
        hero_frame = QFrame()
        hero_frame.setObjectName("HeroFrame")
        hero_frame.setStyleSheet(f"""
            #HeroFrame {{
                background-color: {Theme.CARD};
                border-radius: 12px;
                border: 1px solid {Theme.BORDER};
            }}
        """)
        hero_layout = QHBoxLayout(hero_frame)
        hero_layout.setContentsMargins(30, 30, 30, 30)
        
        # Text Content
        text_layout = QVBoxLayout()
        title = QLabel("Welcome to Your Dashboard")
        title.setStyleSheet(f"font-size: 26px; font-weight: bold; color: {Theme.FOREGROUND}; background: transparent; border: none;")
        
        subtitle = QLabel("Upload your chemical equipment CSV data to visualize flow rates, pressures, and temperatures.")
        subtitle.setStyleSheet(f"font-size: 14px; color: {Theme.FOREGROUND}; background: transparent; border: none;")
        subtitle.setWordWrap(True)
        
        text_layout.addWidget(title)
        text_layout.addWidget(subtitle)
        hero_layout.addLayout(text_layout)
        
        # Simple Stats indicators in Hero (Right side)
        stats_layout = QHBoxLayout()
        
        # Helper to style stats without borders
        def style_stat_labels(lbl, desc):
            lbl.setStyleSheet(f"font-size: 32px; font-weight: bold; color: {lbl.property('color')}; background: transparent; border: none;")
            desc.setStyleSheet(f"color: {Theme.FOREGROUND}; background: transparent; border: none;")

        self.hero_count_lbl = QLabel("—")
        self.hero_count_lbl.setProperty("color", Theme.PRIMARY)
        self.hero_count_desc = QLabel("Equipment")
        style_stat_labels(self.hero_count_lbl, self.hero_count_desc)
        
        hero_stat1 = QVBoxLayout()
        hero_stat1.addWidget(self.hero_count_lbl, 0, Qt.AlignCenter)
        hero_stat1.addWidget(self.hero_count_desc, 0, Qt.AlignCenter)
        
        self.hero_types_lbl = QLabel("—")
        self.hero_types_lbl.setProperty("color", Theme.SECONDARY)
        self.hero_types_desc = QLabel("Types")
        style_stat_labels(self.hero_types_lbl, self.hero_types_desc)
        
        hero_stat2 = QVBoxLayout()
        hero_stat2.addWidget(self.hero_types_lbl, 0, Qt.AlignCenter)
        hero_stat2.addWidget(self.hero_types_desc, 0, Qt.AlignCenter)
        
        stats_layout.addLayout(hero_stat1)
        stats_layout.addSpacing(20)
        stats_layout.addLayout(hero_stat2)
        
        hero_layout.addLayout(stats_layout)
        
        self.layout.addWidget(hero_frame)

    def setup_upload_section(self):
        self.upload_card = QFrame()
        self.upload_card.setProperty("class", "Card")
        # Dashed border simulation handled in paint event or style, for now solid border
        self.upload_card.setStyleSheet(f"""
            QFrame[class="Card"] {{
                background-color: {Theme.CARD};
                border: 2px dashed {Theme.PRIMARY};
                border-radius: 12px;
            }}
        """)
        
        layout = QVBoxLayout(self.upload_card)
        layout.setContentsMargins(40, 40, 40, 40)
        layout.setAlignment(Qt.AlignCenter)
        
        icon_lbl = QLabel("⬆") # Simple icon
        icon_lbl.setStyleSheet(f"font-size: 40px; color: {Theme.PRIMARY}; background: transparent;")
        icon_lbl.setAlignment(Qt.AlignCenter)
        
        title_lbl = QLabel("Upload Equipment Data")
        title_lbl.setStyleSheet(f"font-size: 18px; font-weight: bold; color: {Theme.FOREGROUND}; background: transparent;")
        title_lbl.setAlignment(Qt.AlignCenter)
        
        desc_lbl = QLabel("Select a CSV file containing your equipment specifications")
        desc_lbl.setStyleSheet(f"color: {Theme.BORDER}; background: transparent;")
        desc_lbl.setAlignment(Qt.AlignCenter)
        
        self.upload_btn = ModernButton("Upload Data", is_primary=True)
        self.upload_btn.setObjectName("UploadBtn")
        self.upload_btn.setFixedWidth(200)
        self.upload_btn.setStyleSheet("""
            QPushButton {
                background-color: #073642;
                color: #ffffff;
                border-radius: 6px;
                padding: 10px 20px;
                font-weight: bold;
                font-size: 14px;
                border: none;
            }
            QPushButton:hover {
                background-color: #094b5c;
            }
        """)
        self.upload_btn.clicked.connect(self.browse_file)
        
        layout.addWidget(icon_lbl)
        layout.addWidget(title_lbl)
        layout.addWidget(desc_lbl)
        layout.addSpacing(15)
        layout.addWidget(self.upload_btn, 0, Qt.AlignCenter)
        
        self.layout.addWidget(self.upload_card)

    def setup_stats_section(self):
        self.stats_container = QWidget()
        self.stats_layout = QHBoxLayout(self.stats_container)
        self.stats_layout.setContentsMargins(0, 0, 0, 0)
        self.stats_layout.setSpacing(15)
        
        # Placeholders to be updated
        self.card_total = Card("Total Equipment", "—", "Units registered")
        self.card_flow = Card("Avg Flowrate", "—", "m³/hr")
        self.card_pressure = Card("Avg Pressure", "—", "Pa")
        self.card_temp = Card("Avg Temperature", "—", "°C")
        
        self.stats_layout.addWidget(self.card_total)
        self.stats_layout.addWidget(self.card_flow)
        self.stats_layout.addWidget(self.card_pressure)
        self.stats_layout.addWidget(self.card_temp)
        
        self.stats_container.setVisible(False) # Hidden until data loaded
        self.layout.addWidget(self.stats_container)

    def setup_charts_section(self):
        self.charts_container = QWidget()
        charts_layout = QVBoxLayout(self.charts_container)  # QVBoxLayout for vertical stacking
        charts_layout.setContentsMargins(0, 0, 0, 0)
        charts_layout.setSpacing(25)
        
        # 1. Bar Chart (Distribution)
        bar_frame = QFrame()
        bar_frame.setProperty("class", "Card")
        bar_layout = QVBoxLayout(bar_frame)
        bar_header = QLabel("Equipment Distribution")
        bar_header.setProperty("class", "CardTitle")
        bar_layout.addWidget(bar_header)
        
        self.bar_canvas = MplCanvas(self, width=5, height=4)
        bar_layout.addWidget(self.bar_canvas)
        
        # 2. Pie Chart (Share)
        pie_frame = QFrame()
        pie_frame.setProperty("class", "Card")
        pie_layout = QVBoxLayout(pie_frame)
        pie_header = QLabel("Distribution Share")
        pie_header.setProperty("class", "CardTitle")
        pie_layout.addWidget(pie_header)
        
        self.pie_canvas = MplCanvas(self, width=5, height=5) # Slightly taller
        pie_layout.addWidget(self.pie_canvas)
        
        charts_layout.addWidget(bar_frame)
        charts_layout.addWidget(pie_frame)
        
        self.charts_container.setVisible(False)
        self.layout.addWidget(self.charts_container)

    def browse_file(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Open CSV File", "", "CSV Files (*.csv)")
        if file_path:
            self.upload_file(file_path)

    def upload_file(self, file_path):
        self.upload_btn.setText("Processing...")
        self.upload_btn.setEnabled(False)
        
        try:
            data = self.api_client.upload_csv(file_path)
            self.stats = data.get("statistics", {})
            self.update_ui_with_stats()
            QMessageBox.information(self, "Success", "File uploaded and processed successfully!")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to upload file:\n{str(e)}")
        finally:
            self.upload_btn.setText("Browse CSV File")
            self.upload_btn.setEnabled(True)

    def update_ui_with_stats(self):
        if not self.stats:
            return
            
        # 1. Hero
        total_count = self.stats.get("total_count", 0)
        type_dist = self.stats.get("type_distribution", {})
        
        self.hero_count_lbl.setText(str(total_count))
        self.hero_types_lbl.setText(str(len(type_dist)))
        
        # 2. Cards
        self.card_total.value_lbl.setText(str(total_count))
        self.card_flow.value_lbl.setText(str(self.stats.get("average_flowrate", 0)))
        self.card_pressure.value_lbl.setText(str(self.stats.get("average_pressure", 0)))
        self.card_temp.value_lbl.setText(str(self.stats.get("average_temperature", 0)))
        
        self.stats_container.setVisible(True)
        self.charts_container.setVisible(True)
        
        # 3. Charts
        self.plot_bar_chart(type_dist)
        self.plot_pie_chart(type_dist)

    def plot_bar_chart(self, type_dist):
        labels = list(type_dist.keys())
        values = list(type_dist.values())
        
        self.bar_canvas.axes.clear()
        
        # Dark color for light theme visibility
        TEXT_COLOR = Theme.FOREGROUND 
        
        self.bar_canvas.axes.bar(labels, values, color=Theme.CHART_1, alpha=0.8)
        self.bar_canvas.axes.set_title("Count per Type", color=TEXT_COLOR, fontsize=12, fontweight='bold')
        self.bar_canvas.axes.tick_params(colors=TEXT_COLOR, labelcolor=TEXT_COLOR, axis='x', rotation=45)
        self.bar_canvas.axes.tick_params(colors=TEXT_COLOR, labelcolor=TEXT_COLOR, axis='y')
        
        # Style spines
        for spine in self.bar_canvas.axes.spines.values():
            spine.set_edgecolor(Theme.BORDER)
            
        self.bar_canvas.axes.patch.set_alpha(0) # Transparent background
        
        # Adjust layout to make room for rotated labels
        self.bar_canvas.fig.subplots_adjust(bottom=0.25)
        
        self.bar_canvas.draw()

    def plot_pie_chart(self, type_dist):
        labels = list(type_dist.keys())
        values = list(type_dist.values())
        
        # Extended color palette
        colors = [
            Theme.CHART_1, Theme.CHART_2, Theme.CHART_3, Theme.CHART_4, Theme.CHART_5,
            Theme.CHART_6, Theme.CHART_7, Theme.CHART_8, Theme.CHART_9, Theme.CHART_10
        ]
        
        # Cyclic slice if needed
        color_map = [colors[i % len(colors)] for i in range(len(values))]
        
        self.pie_canvas.axes.clear()
        
        TEXT_COLOR = Theme.FOREGROUND
        
        wedges, texts, autotexts = self.pie_canvas.axes.pie(
            values, labels=labels, autopct='%1.1f%%',
            colors=color_map,
            textprops={'color': TEXT_COLOR},
            wedgeprops={'edgecolor': Theme.CARD, 'linewidth': 1} # Border matching bg
        )
        
        for text in texts:
            text.set_color(TEXT_COLOR)
            text.set_fontsize(9)
            
        for autotext in autotexts:
            autotext.set_color("#ffffff") # Keep inside slices white for contrast against dark headers
            autotext.set_fontweight('bold')
        
        self.pie_canvas.axes.set_title("Type Share", color=TEXT_COLOR, fontsize=12, fontweight='bold')
        self.pie_canvas.draw()
