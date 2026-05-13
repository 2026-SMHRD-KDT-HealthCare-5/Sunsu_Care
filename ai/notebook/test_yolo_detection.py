from ultralytics import YOLO
import cv2
import os

model_path = os.path.join('weights', 'best.pt')
img_path = os.path.join('data', 'box.jpg')

target_dir = os.path.join(os.getcwd(), 'runs', 'predict_test')

model = YOLO(model_path)

model.model.names = {i: 'SP' for i in range(len(model.model.names))}

if not os.path.exists(img_path):
    print(f"오류: '{img_path}' 파일을 찾을 수 없습니다. 경로를 확인해주세요.")
else:
    results = model.predict(
        source=img_path,
        save=True,
        conf=0.6,
        project=target_dir, 
        name='', 
        exist_ok=True
    )
    print(f"탐지 완료! 결과 저장 위치: {target_dir}")