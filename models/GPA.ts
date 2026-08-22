import mongoose from 'mongoose';

export interface IGPA extends mongoose.Document {
  userId: string;
  activeSubjects: any[];
  predictive: {
    active: boolean;
    targetCredits: number;
    targetGPA: number;
    totalDegreeCredits: number;
  };
}

const GPASchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  activeSubjects: { type: [mongoose.Schema.Types.Mixed], default: [] },
  predictive: {
    active: { type: Boolean, default: false },
    targetCredits: { type: Number, default: 15 },
    targetGPA: { type: Number, default: 4.0 },
    totalDegreeCredits: { type: Number, default: 120 }
  }
}, { timestamps: true });

export default mongoose.models.GPA || mongoose.model<IGPA>('GPA', GPASchema);
