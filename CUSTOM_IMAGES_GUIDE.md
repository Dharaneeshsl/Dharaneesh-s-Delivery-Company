# 🎨 Custom Images Guide

This guide will help you customize the images in your Dharaneesh's Delivery Company app.

## 📍 Two Main Image Locations

### 1. **Splash Screen Logo** (`assets/images/logo.svg`)
- **Location**: Appears when the app starts
- **Current**: Custom delivery truck logo with company name
- **Size**: 200x200 pixels (SVG scales perfectly)
- **Usage**: Brand identity and recognition

### 2. **Login Screen Hero Image** (`assets/images/delivery_hero.svg`)
- **Location**: Welcome screen when users log in
- **Current**: Delivery truck with route visualization
- **Size**: 400x300 pixels
- **Usage**: Visual appeal and brand storytelling

## 🎯 How to Customize

### Option 1: Replace with Your Own Images

#### For Logo (Splash Screen):
1. **Create your logo** (recommended formats: SVG, PNG)
2. **Replace the file**: `assets/images/logo.svg`
3. **Recommended size**: 200x200 pixels
4. **Format**: SVG (best quality) or PNG (good compatibility)

#### For Hero Image (Login Screen):
1. **Create your hero image** (recommended formats: SVG, PNG)
2. **Replace the file**: `assets/images/delivery_hero.svg`
3. **Recommended size**: 400x300 pixels
4. **Format**: SVG (best quality) or PNG (good compatibility)

### Option 2: Modify the Existing SVG Files

#### Logo Customization:
- Open `assets/images/logo.svg` in any text editor
- Modify colors, text, or design elements
- Save the file

#### Hero Image Customization:
- Open `assets/images/delivery_hero.svg` in any text editor
- Modify colors, text, or design elements
- Save the file

### Option 3: Use PNG Images Instead

If you prefer PNG images:
1. Convert your images to PNG format
2. Replace the SVG files with PNG files
3. Update the code to use `Image.asset()` instead of `SvgPicture.asset()`

## 🛠️ Tools for Image Creation

### Free Online Tools:
- **Canva**: Professional design templates
- **Figma**: Vector graphics and design
- **GIMP**: Free Photoshop alternative
- **Inkscape**: Free vector graphics editor

### Professional Tools:
- **Adobe Illustrator**: Vector graphics
- **Adobe Photoshop**: Raster graphics
- **Sketch**: UI/UX design

## 🎨 Design Tips

### Logo Design:
- **Keep it simple**: Should be recognizable at small sizes
- **Use your brand colors**: Match your app's theme
- **Include company name**: "Dharaneesh's Delivery"
- **Delivery theme**: Include truck, package, or delivery elements
- **Scalable**: Should look good at different sizes

### Hero Image Design:
- **Tell a story**: Show delivery process or benefits
- **Use your brand colors**: Blue (#2563EB) and Green (#10B981)
- **Include action**: Show movement or delivery in progress
- **Professional look**: Clean, modern design
- **Appropriate size**: Not too busy, easy to understand

## 🔧 Technical Implementation

### Current Code Structure:
```dart
// Splash Screen
SvgPicture.asset(
  'assets/images/logo.svg',
  width: 80,
  height: 80,
  fit: BoxFit.contain,
)

// Login Screen
SvgPicture.asset(
  'assets/images/delivery_hero.svg',
  width: 200,
  height: 150,
  fit: BoxFit.contain,
)
```

### To Use PNG Instead:
```dart
// Replace SvgPicture.asset with Image.asset
Image.asset(
  'assets/images/logo.png',
  width: 80,
  height: 80,
  fit: BoxFit.contain,
)
```

## 📱 Image Specifications

### Logo Requirements:
- **Format**: SVG (preferred) or PNG
- **Size**: 200x200 pixels minimum
- **Background**: Transparent or white
- **Colors**: Match your brand theme
- **Style**: Professional, recognizable

### Hero Image Requirements:
- **Format**: SVG (preferred) or PNG
- **Size**: 400x300 pixels minimum
- **Background**: Light or transparent
- **Content**: Delivery-related imagery
- **Style**: Modern, engaging

## 🚀 Quick Start

### Step 1: Prepare Your Images
1. Create or find your logo image
2. Create or find your hero image
3. Ensure they meet the size requirements

### Step 2: Replace Files
1. Copy your logo to `assets/images/logo.svg` (or .png)
2. Copy your hero image to `assets/images/delivery_hero.svg` (or .png)

### Step 3: Test
1. Run `flutter pub get`
2. Run `flutter run`
3. Check both splash screen and login screen

## 🔄 Converting Between Formats

### SVG to PNG:
```bash
# Install cairosvg
pip install cairosvg

# Run the conversion script
python convert_images.py
```

### PNG to SVG:
- Use online converters like CloudConvert
- Or use professional tools like Adobe Illustrator

## 🎯 Brand Guidelines

### Recommended Colors:
- **Primary Blue**: #2563EB
- **Primary Green**: #10B981
- **Accent Orange**: #F59E0B
- **Text Dark**: #1E293B
- **Text Light**: #64748B

### Typography:
- **Font Family**: Poppins (already included)
- **Logo Text**: Bold, clear
- **Hero Text**: Readable at small sizes

## 📞 Need Help?

If you need assistance with image creation or customization:
1. Check the existing SVG files for reference
2. Use the conversion script for format changes
3. Test your images on different screen sizes
4. Ensure your images match your brand identity

## ✨ Pro Tips

1. **Test on different devices**: Images should look good on phones and tablets
2. **Keep file sizes small**: Optimize images for faster loading
3. **Use consistent branding**: Match your website and other materials
4. **Consider dark mode**: Ensure images work in both light and dark themes
5. **Backup your originals**: Keep copies of your original image files

---

**Happy designing! 🎨 Your custom images will make your delivery app truly unique and professional.** 