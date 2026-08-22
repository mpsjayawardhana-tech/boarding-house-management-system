const mongoose = require('mongoose');

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

const AppState = mongoose.models.AppState || mongoose.model('AppState', AppStateSchema);

const defaultUsers = [
  { id: '1', name: 'Manusha', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Manusha', isActive: true, role: 'admin', status: 'active', username: 'Manusha', password: 'abc123', roomId: 'room_1', birthday: '2004-12-01', email: 'manusha@example.com', phone: '0712345678', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
  { id: '2', name: 'Kasun', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Kasun', isActive: true, role: 'member', status: 'active', username: 'kasun', password: 'abc123', roomId: 'room_1', birthday: '2000-01-01', email: 'kasun@example.com', phone: '0711111111', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
  { id: '3', name: 'Champika', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Champika', isActive: true, role: 'member', status: 'active', username: 'champika', password: 'abc123', roomId: 'room_1', birthday: '2001-02-02', email: 'champika@example.com', phone: '0722222222', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
  { id: '4', name: 'Janidu', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Janidu', isActive: true, role: 'member', status: 'active', username: 'janidu', password: 'abc123', roomId: 'room_1', birthday: '2002-03-03', email: 'janidu@example.com', phone: '0733333333', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
  { id: '5', name: 'Binoj', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Binoj', isActive: true, role: 'member', status: 'active', username: 'binoj', password: 'abc123', roomId: 'room_1', birthday: '2003-04-04', email: 'binoj@example.com', phone: '0744444444', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
  { id: '6', name: 'Kaveeth', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Kaveeth', isActive: true, role: 'member', status: 'active', username: 'kaveeth', password: 'abc123', roomId: 'room_1', birthday: '2005-05-05', email: 'kaveeth@example.com', phone: '0755555555', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
  { id: '7', name: 'SuperAdmin', avatar: 'https://api.dicebear.com/8.x/notionists/svg?seed=Super', isActive: true, role: 'super_admin', status: 'active', username: 'superadmin', password: 'superpassword', roomId: null, email: 'super@admin.com', dashboardLayout: ['overview', 'monthly', 'timetable', 'duties', 'financial', 'inventory', 'feeTracker', 'heatmap'] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");
    
    const appState = await AppState.findOne();
    if (appState) {
      console.log("Found existing AppState. Injecting all default users...");
      appState.state.users = defaultUsers;
      // Mark as modified since it's a Mixed type
      appState.markModified('state');
      await appState.save();
      console.log("Seed successful!");
    } else {
      console.log("No AppState found. Please load the app once to create the initial state, then run this script again.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
}

seed();
