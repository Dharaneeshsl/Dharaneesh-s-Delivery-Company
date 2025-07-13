#!/usr/bin/env python3
"""
Image Conversion Script for Dharaneesh's Delivery Company
Converts SVG images to PNG format for better compatibility
"""

import os
import sys
from pathlib import Path

def convert_svg_to_png(svg_path, png_path, width=200, height=200):
    """
    Convert SVG to PNG using cairosvg (if available) or provide instructions
    """
    try:
        import cairosvg
        cairosvg.svg2png(url=svg_path, write_to=png_path, output_width=width, output_height=height)
        print(f"✅ Converted {svg_path} to {png_path}")
        return True
    except ImportError:
        print(f"⚠️  cairosvg not installed. Please install it with: pip install cairosvg")
        print(f"   Or manually convert {svg_path} to {png_path}")
        return False

def main():
    # Create assets/images directory if it doesn't exist
    assets_dir = Path("assets/images")
    assets_dir.mkdir(parents=True, exist_ok=True)
    
    # Convert logo
    logo_svg = assets_dir / "logo.svg"
    logo_png = assets_dir / "logo.png"
    
    if logo_svg.exists():
        convert_svg_to_png(str(logo_svg), str(logo_png), 200, 200)
    else:
        print("❌ logo.svg not found")
    
    # Convert hero image
    hero_svg = assets_dir / "delivery_hero.svg"
    hero_png = assets_dir / "delivery_hero.png"
    
    if hero_svg.exists():
        convert_svg_to_png(str(hero_svg), str(hero_png), 400, 300)
    else:
        print("❌ delivery_hero.svg not found")
    
    print("\n🎨 Image Conversion Complete!")
    print("📱 You can now use either SVG or PNG images in your app")

if __name__ == "__main__":
    main() 