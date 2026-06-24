---
name: powerpoint
description: Create, read, edit, and analyze PowerPoint presentations (.pptx files). Add/modify slides, text, shapes, images, tables, and charts. Extract content and metadata. Use when working with presentations, creating reports, modifying slide decks, or analyzing presentation data.
allowed-tools: Bash, Read, Write, Glob, Grep
---

# PowerPoint Skill

This skill provides comprehensive PowerPoint (.pptx) manipulation using `python-pptx` library with `uv` for fast dependency management.

## Installation

This skill uses `uv` for Python tooling. Install dependencies with:

```bash
uv pip install python-pptx pillow
```

Or run scripts directly with `uv run` (auto-installs dependencies):

```bash
uv run --with python-pptx script.py
```

## Quick Start Examples

### 1. Create a new presentation

```python
from pptx import Presentation
from pptx.util import Inches

prs = Presentation()

# Add title slide
title_slide_layout = prs.slide_layouts[0]
slide = prs.slides.add_slide(title_slide_layout)
title = slide.shapes.title
subtitle = slide.placeholders[1]

title.text = "My Presentation"
subtitle.text = "Created with Claude"

prs.save('presentation.pptx')
```

Run with: `uv run --with python-pptx create_presentation.py`

### 2. Add content slides

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation('presentation.pptx')

# Add bullet slide
bullet_slide_layout = prs.slide_layouts[1]
slide = prs.slides.add_slide(bullet_slide_layout)

title = slide.shapes.title
content = slide.placeholders[1]

title.text = "Key Points"
text_frame = content.text_frame
text_frame.text = "First point"

p = text_frame.add_paragraph()
p.text = "Second point"
p.level = 0

prs.save('presentation.pptx')
```

### 3. Read and extract content

```python
from pptx import Presentation

prs = Presentation('presentation.pptx')

for i, slide in enumerate(prs.slides):
    print(f"Slide {i + 1}:")
    for shape in slide.shapes:
        if hasattr(shape, "text"):
            print(f"  {shape.text}")
```

## Common Operations

### Add text box

```python
from pptx.util import Inches, Pt

textbox = slide.shapes.add_textbox(Inches(1), Inches(1), Inches(8), Inches(1))
text_frame = textbox.text_frame
text_frame.text = "Your text here"

# Format text
paragraph = text_frame.paragraphs[0]
paragraph.font.size = Pt(24)
paragraph.font.bold = True
```

### Insert image

```python
from pptx.util import Inches

left = Inches(1)
top = Inches(2)
height = Inches(3)

slide.shapes.add_picture('image.jpg', left, top, height=height)
```

### Add shape

```python
from pptx.util import Inches
from pptx.enum.shapes import MSO_SHAPE

left = Inches(1)
top = Inches(2)
width = Inches(3)
height = Inches(1.5)

shape = slide.shapes.add_shape(
    MSO_SHAPE.RECTANGLE, left, top, width, height
)
shape.text = "Rectangle with text"
```

### Create table

```python
from pptx.util import Inches

rows = 3
cols = 3
left = Inches(1)
top = Inches(2)
width = Inches(8)
height = Inches(3)

table = slide.shapes.add_table(rows, cols, left, top, width, height).table

# Populate table
table.cell(0, 0).text = "Header 1"
table.cell(0, 1).text = "Header 2"
table.cell(1, 0).text = "Data 1"
table.cell(1, 1).text = "Data 2"
```

### Add chart

```python
from pptx.util import Inches
from pptx.enum.chart import XL_CHART_TYPE
from pptx.chart.data import CategoryChartData

chart_data = CategoryChartData()
chart_data.categories = ['Q1', 'Q2', 'Q3', 'Q4']
chart_data.add_series('Sales', (100, 150, 120, 180))

x, y, cx, cy = Inches(2), Inches(2), Inches(6), Inches(4)
slide.shapes.add_chart(
    XL_CHART_TYPE.COLUMN_CLUSTERED, x, y, cx, cy, chart_data
)
```

## Helper Scripts

The skill includes helper scripts in the `scripts/` directory:

- `create_presentation.py` - Create a new presentation from scratch
- `add_slides.py` - Add slides to existing presentation
- `extract_content.py` - Extract text and metadata from presentations
- `modify_presentation.py` - Modify existing presentations
- `create_report.py` - Generate report-style presentations from data

## Running Scripts with uv

All scripts can be run directly with `uv`:

```bash
# Run with inline dependencies
uv run --with python-pptx scripts/create_presentation.py

# Or use the project's pyproject.toml
cd .claude/skills/powerpoint
uv run scripts/create_presentation.py
```

## Use Cases

1. **Create presentations from data** - Generate slide decks from CSV, JSON, or database data
2. **Automate report generation** - Create standardized reports with charts and tables
3. **Extract presentation content** - Parse and analyze existing presentations
4. **Bulk modify presentations** - Update multiple presentations with new branding or content
5. **Convert data to slides** - Transform spreadsheets or documents into presentations
6. **Template-based generation** - Use templates to create consistent presentations

## Slide Layouts

Standard slide layouts (indices):
- 0: Title Slide
- 1: Title and Content
- 2: Section Header
- 3: Two Content
- 4: Comparison
- 5: Title Only
- 6: Blank
- 7: Content with Caption
- 8: Picture with Caption

## Python-pptx Key Concepts

- **Presentation**: The top-level container (.pptx file)
- **Slide**: Individual slides in the presentation
- **Shape**: Objects on a slide (text boxes, images, tables, charts)
- **Placeholder**: Pre-positioned shapes in slide layouts
- **Text Frame**: Container for text within a shape
- **Paragraph**: Text unit within a text frame
- **Run**: Formatted text segment within a paragraph

## Measurement Units

Use `pptx.util` for measurements:

```python
from pptx.util import Inches, Pt, Cm, Emu

width = Inches(5)      # 5 inches
height = Cm(10)        # 10 centimeters
font_size = Pt(18)     # 18 points
```

## When Claude Should Use This Skill

- User asks to create, edit, or analyze PowerPoint files
- User mentions .pptx files or presentations
- User wants to generate reports as presentations
- User needs to extract data from presentations
- User wants to automate slide creation
- User asks about presentation formatting or structure
