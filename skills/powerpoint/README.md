# PowerPoint Skill for Claude Code

A comprehensive Claude Code skill for creating, editing, and analyzing PowerPoint presentations using `python-pptx` and `uv` for fast Python tooling.

## Installation

This skill uses `uv` for Python package management. Install `uv` if you haven't already:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Dependencies are automatically installed when you run scripts with `uv run --with python-pptx`.

Alternatively, install dependencies in the project:

```bash
cd .claude/skills/powerpoint
uv pip install -e .
```

## Quick Start

### Create a new presentation

```bash
uv run --with python-pptx scripts/create_presentation.py output.pptx "My Title" "Subtitle"
```

### Extract content from a presentation

```bash
uv run --with python-pptx scripts/extract_content.py presentation.pptx
```

### Add slides to existing presentation

```bash
uv run --with python-pptx scripts/add_slides.py presentation.pptx bullet "New Slide" "Content"
```

### Create a report from JSON data

```bash
uv run --with python-pptx scripts/create_report.py output.pptx data.json
```

## Helper Scripts

- **create_presentation.py** - Create new presentations with title slides
- **extract_content.py** - Extract text and metadata from presentations
- **add_slides.py** - Add slides to existing presentations
- **create_report.py** - Generate reports from structured JSON data

## Usage with Claude Code

This skill is automatically discovered by Claude Code when working with PowerPoint files. Simply ask Claude to:

- "Create a presentation about quarterly results"
- "Extract the content from presentation.pptx"
- "Add a slide with bullet points to my deck"
- "Generate a report presentation from this data"

Claude will automatically use this skill to help you.

## Python-pptx Basics

### Creating Presentations

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()
slide = prs.slides.add_slide(prs.slide_layouts[0])
prs.save('output.pptx')
```

### Reading Presentations

```python
from pptx import Presentation

prs = Presentation('input.pptx')
for slide in prs.slides:
    for shape in slide.shapes:
        if hasattr(shape, "text"):
            print(shape.text)
```

### Common Slide Layouts

- 0: Title Slide
- 1: Title and Content
- 2: Section Header
- 3: Two Content
- 4: Comparison
- 5: Title Only
- 6: Blank

## Example: Creating a Data Report

Create a `data.json` file:

```json
{
    "title": "Q4 2025 Results",
    "subtitle": "Financial Performance",
    "sections": [
        {
            "title": "Revenue",
            "slides": [
                {
                    "title": "Key Metrics",
                    "content": [
                        "Total Revenue: $5M",
                        "Growth: 25% YoY",
                        "Profit Margin: 18%"
                    ]
                }
            ]
        }
    ]
}
```

Generate the presentation:

```bash
uv run --with python-pptx scripts/create_report.py q4_results.pptx data.json
```

## Advanced Features

### Add Images

```python
from pptx.util import Inches
slide.shapes.add_picture('chart.png', Inches(1), Inches(2), height=Inches(4))
```

### Create Tables

```python
from pptx.util import Inches
table = slide.shapes.add_table(3, 3, Inches(1), Inches(2), Inches(8), Inches(3)).table
```

### Add Charts

```python
from pptx.enum.chart import XL_CHART_TYPE
from pptx.chart.data import CategoryChartData

chart_data = CategoryChartData()
chart_data.categories = ['Q1', 'Q2', 'Q3', 'Q4']
chart_data.add_series('Sales', (100, 150, 120, 180))

slide.shapes.add_chart(
    XL_CHART_TYPE.COLUMN_CLUSTERED,
    Inches(2), Inches(2), Inches(6), Inches(4),
    chart_data
)
```

## License

This skill is provided as-is for use with Claude Code.

## Resources

- [python-pptx documentation](https://python-pptx.readthedocs.io/)
- [uv documentation](https://docs.astral.sh/uv/)
- [Claude Code documentation](https://code.claude.com/)
