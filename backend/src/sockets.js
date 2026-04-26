
module.exports = (io) => {
  io.on('connection', (socket) => {
     console.log('✅ User connected:', socket.id);
    
    // We will use this later for real-time updates
    socket.on('disconnect', () => {
      console.log('❌ User disconnected');
    });
  });
};