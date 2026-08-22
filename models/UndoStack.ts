import mongoose from 'mongoose';

export interface IUndoStack extends mongoose.Document {
  snapshots: any[];
}

const UndoStackSchema = new mongoose.Schema({
  snapshots: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
}, { timestamps: true });

export default mongoose.models.UndoStack || mongoose.model<IUndoStack>('UndoStack', UndoStackSchema);
