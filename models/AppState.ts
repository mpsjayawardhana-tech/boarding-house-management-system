import mongoose from 'mongoose';

export interface IAppState extends mongoose.Document {
  state: any;
  version: number;
}

const AppStateSchema = new mongoose.Schema({
  state: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  version: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

export default mongoose.models.AppState || mongoose.model<IAppState>('AppState', AppStateSchema);
