module.exports = function(io, rooms){

    var chatrooms = io.of('/roomlist').on('connection', function(socket){
        console.log('connection established on the server');
        socket.emit('roomupdate', JSON.stringify(rooms)); //update room list when refresh

        socket.on('newroom', function(data){
            rooms.push(data);
            socket.broadcast.emit('roomupdate', JSON.stringify(rooms)); //broadcast to all except active socket
            socket.emit('roomupdate', JSON.stringify(rooms)); //broadcast to active socket

        })
    });

    var messages = io.of('/messages').on('connection', function(socket){
        console.log('connection ready from server to receive message');
        socket.on('joinroom', function(data){
            socket.username = data.user;
            socket.userpic = data.userPic;
            socket.join(data.room);
            updateUserList(data.room, true); //update user list when join
        });

        socket.on('newMessage', function(data){
            socket.broadcast.to(data.room_number).emit('messageFeed', JSON.stringify(data));
        })

        function updateUserList(room, updateAll) {
            var nsp = io.of('/messages');
            var clientsInRoom = nsp.adapter.rooms[room];
            var usersArray =[];
            for(var client in clientsInRoom){
            usersArray.push(nsp.connected[client]);
            }
            var getUsers = usersArray;
            var userList =[];
            for(var i in getUsers) {
                userList.push({user:getUsers[i].username, userPic:getUsers[i].userpic});
            }

            socket.to(room).emit('updateUserList', JSON.stringify(userList));

            if(updateAll) {
                socket.broadcast.to(room).emit('updateUserList', JSON.stringify(userList));
            }
        }

        socket.on('updateList', function(data){
            updateUserList(data.room);
        })
    })





}
