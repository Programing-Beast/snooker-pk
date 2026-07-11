from pathlib import Path
from PIL import Image
from rembg import remove, new_session

def batch_remove_bg(input_folder, output_folder):
    in_dir = Path(input_folder)
    out_dir = Path(output_folder)
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # Initialize a reusable session for better performance
    session = new_session()
    
    # Supported extensions
    extensions = ('*.jpg', '*.jpeg', '*.png', '*.webp')
    image_files = []
    for ext in extensions:
        image_files.extend(in_dir.glob(ext))
        
    print(f"Found {len(image_files)} images to process...")
    
    for img_path in image_files:
        try:
            print(f"Processing: {img_path.name}")
            output_path = out_dir / f"{img_path.stem}_no_bg.png"
            
            with Image.open(img_path) as img:
                output_img = remove(img, session=session)
                output_img.save(output_path, "PNG")
                
        except Exception as e:
            print(f"Failed to process {img_path.name}: {e}")

if __name__ == "__main__":
    batch_remove_bg("my_raw_photos", "processed_photos")
