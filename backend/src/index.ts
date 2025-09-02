import dotenv from 'dotenv';
import path from 'path'

// Point to the correct location of .env manually
dotenv.config({ path: path.resolve(__dirname, '../.env') }) // ✅
import express from 'express';
import cors from 'cors';

import router from "./colors"



const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());
app.use("/api",router)
app.use((req,res)=>{
  res.status(404).json({message:"end point not found"})
})

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
