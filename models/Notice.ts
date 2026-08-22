import mongoose from 'mongoose';

export interface INotice extends mongoose.Document {
  id: string; // explicitly store a string id for frontend compatibility
  scope: 'common' | 'me';
  priority: 'normal' | 'event' | 'emergency';
  title: string;
  description: string;
  dueDate?: string;
  createdAt: string;
  createdBy: string;
  isDone?: boolean;
}

const NoticeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  scope: { type: String, enum: ['common', 'me'], required: true },
  priority: { type: String, enum: ['normal', 'event', 'emergency'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: String },
  createdAt: { type: String, required: true },
  createdBy: { type: String, required: true },
  isDone: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);
