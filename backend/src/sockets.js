
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ User connected via Socket.io');
    
    // We will use this later for real-time updates
    socket.on('disconnect', () => {
      console.log('❌ User disconnected');
    });
  });
};