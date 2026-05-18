// generate random room id
const generateRoomId = () => {
  return Math.random()
    .toString(36)
    .substring(2, 8);
};

export default generateRoomId;