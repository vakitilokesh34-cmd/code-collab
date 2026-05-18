// copy room invite link
export default async function copyRoomLink(
  roomId
) {

  try {

    // room url
    const link =
      `${window.location.origin}/room/${roomId}`;

    // copy
    await navigator.clipboard.writeText(
      link
    );

    return {
      success: true,
      message:
        "Room link copied",
    };

  } catch (error) {

    console.log(error);

    return {
      success: false,
      message:
        "Failed to copy link",
    };
  }
}