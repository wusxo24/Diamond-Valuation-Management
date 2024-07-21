from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import pandas as pd
import pickle
import io
from sklearn.preprocessing import StandardScaler
from fastapi.responses import JSONResponse
app = FastAPI()
origins = [
    "http://localhost:5173",  # React development server
    # Add any other origins that should be allowed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model  #diamond_cnn.pth
# class DiamondCNN(nn.Module):
#     def __init__(self):
#         super(DiamondCNN, self).__init__()
#         self.conv1 = nn.Conv2d(3, 16, kernel_size=3, stride=1, padding=1)
#         self.bn1 = nn.BatchNorm2d(16)
#         self.conv2 = nn.Conv2d(16, 32, kernel_size=3, stride=1, padding=1)
#         self.bn2 = nn.BatchNorm2d(32)
#         self.conv3 = nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1)
#         self.bn3 = nn.BatchNorm2d(64)
#         self.pool = nn.MaxPool2d(kernel_size=2, stride=2, padding=0)
#         self.fc1 = nn.Linear(64 * 28 * 28, 512)
#         self.dropout1 = nn.Dropout(0.5)
#         self.fc2 = nn.Linear(512, 256)
#         self.dropout2 = nn.Dropout(0.5)
#         self.fc3 = nn.Linear(256, 8)  # 8 output features

#     def forward(self, x):
#         x = self.pool(F.relu(self.bn1(self.conv1(x))))
#         x = self.pool(F.relu(self.bn2(self.conv2(x))))
#         x = self.pool(F.relu(self.bn3(self.conv3(x))))
#         x = x.view(-1, 64 * 28 * 28)
#         x = F.relu(self.fc1(x))
#         x = self.dropout1(x)
#         x = F.relu(self.fc2(x))
#         x = self.dropout2(x)
#         x = self.fc3(x)
#         return x


# Load the model #diamond_cnn_01.pth
class DiamondCNN(nn.Module):
    def __init__(self):
        super(DiamondCNN, self).__init__()
        self.conv1 = nn.Conv2d(3, 16, kernel_size=3, stride=1, padding=1)
        self.bn1 = nn.BatchNorm2d(16)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, stride=1, padding=1)
        self.bn2 = nn.BatchNorm2d(32)
        self.conv3 = nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1)
        self.bn3 = nn.BatchNorm2d(64)
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2, padding=0)
        self.fc1 = nn.Linear(64 * 28 * 28, 512)
        self.dropout1 = nn.Dropout(0.5)
        self.fc2 = nn.Linear(512, 256)
        self.dropout2 = nn.Dropout(0.5)
        self.fc3 = nn.Linear(256, 8)  # 8 output features

    def forward(self, x):
        x = self.pool(F.relu(self.bn1(self.conv1(x))))
        x = self.pool(F.relu(self.bn2(self.conv2(x))))
        x = self.pool(F.relu(self.bn3(self.conv3(x))))
        x = x.view(-1, 64 * 28 * 28)
        x = F.relu(self.fc1(x))
        x = self.dropout1(x)
        x = F.relu(self.fc2(x))
        x = self.dropout2(x)
        x = self.fc3(x)
        return x
    
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
cnn_model = DiamondCNN().to(device)
cnn_model.load_state_dict(torch.load('diamond_cnn_01.pth'))
cnn_model.eval()

# Load the label encoders
with open('label_encoders.pkl', 'rb') as f:
    label_encoders = pickle.load(f)

# Preprocess the input image
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

class InferenceRequest(BaseModel):
    image: bytes

@app.post("/predict-cnn/")
async def predict(file: UploadFile = File(...)):
    image = Image.open(io.BytesIO(await file.read())).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = cnn_model(image)
        outputs = outputs.cpu().numpy().flatten()

    # Clamp the categorical outputs to the valid range
    shape_index = np.clip(int(outputs[0]), 0, len(label_encoders['shape'].classes_) - 1)
    clarity_index = np.clip(int(outputs[2]), 0, len(label_encoders['clarity'].classes_) - 1)
    colour_index = np.clip(int(outputs[3]), 0, len(label_encoders['colour'].classes_) - 1)
    cut_index = np.clip(int(outputs[4]), 0, len(label_encoders['cut'].classes_) - 1)
    polish_index = np.clip(int(outputs[5]), 0, len(label_encoders['polish'].classes_) - 1)
    symmetry_index = np.clip(int(outputs[6]), 0, len(label_encoders['symmetry'].classes_) - 1)
    fluorescence_index = np.clip(int(outputs[7]), 0, len(label_encoders['fluorescence'].classes_) - 1)

    # Decode the labels
    decoded_output = {
        'shape': label_encoders['shape'].inverse_transform([shape_index])[0],
        'carat': float(outputs[1]),
        'clarity': label_encoders['clarity'].inverse_transform([clarity_index])[0],
        'colour': label_encoders['colour'].inverse_transform([colour_index])[0],
        'cut': label_encoders['cut'].inverse_transform([cut_index])[0],
        'polish': label_encoders['polish'].inverse_transform([polish_index])[0],
        'symmetry': label_encoders['symmetry'].inverse_transform([symmetry_index])[0],
        'fluorescence': label_encoders['fluorescence'].inverse_transform([fluorescence_index])[0]
    }

    # Ensure all values are Python native types
    for key, value in decoded_output.items():
        if isinstance(value, np.generic):
            decoded_output[key] = value.item()

    return decoded_output


class DiamondFeatures(BaseModel):
    carat: float
    cut: str
    color: str
    clarity: str
    depth: float
    table: float
    x: float
    y: float
    z: float

class Net(nn.Module):
    def __init__(self, input_size, num_classes):
        super(Net, self).__init__()
        self.fc11 = nn.Linear(input_size, 90)
        self.fc12 = nn.Linear(90, 30)
        self.fc13 = nn.Linear(30, 15)
        self.fc21 = nn.Linear(input_size, 90)
        self.fc22 = nn.Linear(90, 30)
        self.fc23 = nn.Linear(30, 15)
        self.fc3 = nn.Linear(30, num_classes)
        self.bn1 = nn.BatchNorm1d(90)
        self.bn2 = nn.BatchNorm1d(30)
        self.bn3 = nn.BatchNorm1d(15)
        
    def forward(self, x):
        x1 = F.relu(self.bn1(self.fc11(x)))
        x1 = F.relu(self.bn2(self.fc12(x1)))
        x1 = F.relu(self.bn3(self.fc13(x1)))
        
        x2 = F.softplus(self.bn1(self.fc21(x)))
        x2 = F.softplus(self.bn2(self.fc22(x2)))
        x2 = F.softplus(self.bn3(self.fc23(x2)))
        
        x = F.relu(self.fc3(torch.cat([x1, x2], dim=1)))
        return x

# Load the trained model
input_size = 29  # Adjust this based on the number of input features
num_classes = 1
mlp_model = Net(input_size, num_classes)
mlp_model.load_state_dict(torch.load('diamond_price_model_02.pth'),map_location=torch.device('cpu'))
mlp_model.eval()

@app.post("/predict-price/")
def predict(features: DiamondFeatures):
    # Convert input data to DataFrame
    data = features.dict()
    df = pd.DataFrame([data])
    
    # Preprocess the data
    categorical = ['cut', 'color', 'clarity']
    df = pd.get_dummies(df, columns=categorical)
    df['xyz'] = df['x'] * df['y'] * df['z']
    df['table_xy'] = (df['table'].mean() * (df['x'] * df['y']).mean() - df['table'] * (df['x'] * df['y']))
    df['depth_z'] = (df['depth'].mean() * df['z'].mean() - df['depth'] * df['z'])

    column_names = ['carat', 'depth', 'table', 'x', 'y', 'z', 
                    'cut_Fair', 'cut_Good', 'cut_Ideal', 'cut_Premium', 'cut_Very Good',
                    'color_D', 'color_E', 'color_F', 'color_G', 'color_H', 'color_I', 'color_J',
                    'clarity_I1', 'clarity_IF', 'clarity_SI1', 'clarity_SI2', 'clarity_VS1',
                    'clarity_VS2', 'clarity_VVS1', 'clarity_VVS2', 'xyz', 'table_xy', 'depth_z']
    missing_cols = set(column_names) - set(df.columns)
    for col in missing_cols:
        df[col] = 0
    df = df[column_names]

    # Convert bool columns to int
    for col in df.columns:
        if df[col].dtype == 'bool':
            df[col] = df[col].astype(int)

    # Scale numerical features
    scale_feats = [col for col in df.columns if df[col].dtypes == 'float64']
    scaler = StandardScaler()
    df_scaled = df.copy()
    df_scaled[scale_feats] = scaler.fit_transform(df[scale_feats])
    input_tensor = torch.Tensor(df.values)

    # Make prediction
    with torch.no_grad():
        prediction = mlp_model(input_tensor).cpu().numpy()
        predicted_price = float(prediction[0][0])  # Convert numpy float to Python float
    
    return {"predicted_price": predicted_price }









df = pd.read_csv('realtime_diamonds.csv')

@app.get("/prices/cushion")
async def get_cushion_prices():
    cushion_df = df[df['Shape'] == 'CUSHION']
    return JSONResponse(content=cushion_df.to_dict(orient="records"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
