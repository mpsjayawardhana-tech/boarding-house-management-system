const mongoose = require('mongoose');
const AppStateSchema = new mongoose.Schema({ state: mongoose.Schema.Types.Mixed }, { timestamps: true });
const AppState = mongoose.models.AppState || mongoose.model('AppState', AppStateSchema);

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const doc = await AppState.findOne();
  if (doc) {
    console.log("Keys in doc.state:", Object.keys(doc.state || {}));
    if (doc.state.state) {
      console.log("Keys in doc.state.state:", Object.keys(doc.state.state || {}));
    }
  }
  process.exit();
}
check();
