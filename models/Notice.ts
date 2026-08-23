import mongoose from 'mongoose';

export type NoticeType = 'academic' | 'hostel' | 'emergency' | 'personal';

export interface INotice extends mongoose.Document {
  id: string; // explicitly store a string id for frontend compatibility
  type: NoticeType;
  title: string;
  description: string;
  date?: string;
  createdAt: string;
  createdBy: string;
  isDone?: boolean;
}

const NoticeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, enum: ['academic', 'hostel', 'emergency', 'personal'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String },
  createdAt: { type: String, required: true },
  createdBy: { type: String, required: true },
  isDone: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);
