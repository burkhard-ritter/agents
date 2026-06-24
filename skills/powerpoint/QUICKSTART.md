# PowerPoint Skill Quick Start

Get started with the PowerPoint skill in 5 minutes.

## Installation

Install `uv` (if not already installed):

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

That's it! Dependencies are automatically handled by `uv`.

## Basic Commands

### 1. Create a New Presentation

```bash
uv run --with python-pptx scripts/create_presentation.py \
    my_presentation.pptx \
    "My Presentation Title" \
    "Optional Subtitle"
```

### 2. Extract Content from PowerPoint

```bash
# Text format (human-readable)
uv run --with python-pptx scripts/extract_content.py presentation.pptx

# JSON format (for processing)
uv run --with python-pptx scripts/extract_content.py presentation.pptx --format json
```

### 3. Add Slides to Existing Presentation

```bash
# Add a bullet slide
uv run --with python-pptx scripts/add_slides.py \
    presentation.pptx \
    bullet \
    "Slide Title" \
    "First bullet point"

# Add a section header
uv run --with python-pptx scripts/add_slides.py \
    presentation.pptx \
    section \
    "New Section"

# Add a blank slide
uv run --with python-pptx scripts/add_slides.py \
    presentation.pptx \
    blank
```

### 4. Generate Report from Data

```bash
uv run --with python-pptx scripts/create_report.py \
    output.pptx \
    templates/example_report_data.json
```

## Using with Claude Code

Once installed, simply ask Claude to work with PowerPoint files:

**Example prompts:**
- "Create a presentation about our Q4 results"
- "Extract all text from presentation.pptx"
- "Add a slide with these bullet points to my deck"
- "Generate a presentation from this CSV data"

Claude will automatically use this skill!

## Python Usage

### Inline Script

Create a file `my_script.py`:

```python
from pptx import Presentation
from pptx.util import Inches

prs = Presentation()
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "Hello from Python!"
prs.save('output.pptx')
```

Run with:

```bash
uv run --with python-pptx my_script.py
```

### Using Project Dependencies

Navigate to the skill directory:

```bash
cd .claude/skills/powerpoint
uv run python -c "from pptx import Presentation; print('Ready!')"
```

## Next Steps

- Read `README.md` for comprehensive documentation
- Check `SKILL.md` for detailed API reference
- Explore `templates/example_report_data.json` for report structure
- Try the example scripts in `scripts/` directory

## Troubleshooting

**Script not found?**
```bash
# Make sure you're in the right directory
cd /path/to/project
ls .claude/skills/powerpoint/scripts/
```

**uv not found?**
```bash
# Reinstall uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Restart your shell
source ~/.bashrc  # or ~/.zshrc
```

**Permission denied?**
```bash
# Make scripts executable
chmod +x .claude/skills/powerpoint/scripts/*.py
```

## Common Patterns

### Pattern 1: Data to Presentation Pipeline

```bash
# 1. Extract data
curl https://api.example.com/data > data.json

# 2. Create presentation
uv run --with python-pptx scripts/create_report.py report.pptx data.json

# 3. Extract for review
uv run --with python-pptx scripts/extract_content.py report.pptx
```

### Pattern 2: Template Customization

```bash
# 1. Create base template
uv run --with python-pptx scripts/create_presentation.py template.pptx "Template"

# 2. Add standard slides
uv run --with python-pptx scripts/add_slides.py template.pptx section "Introduction"
uv run --with python-pptx scripts/add_slides.py template.pptx bullet "Overview" "Point 1"

# 3. Use as template (copy and modify)
cp template.pptx new_presentation.pptx
```

### Pattern 3: Batch Processing

```bash
# Extract content from multiple presentations
for file in *.pptx; do
    echo "Processing $file"
    uv run --with python-pptx scripts/extract_content.py "$file" --format json > "${file%.pptx}.json"
done
```

Happy presenting! 🎉
