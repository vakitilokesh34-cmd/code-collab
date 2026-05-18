import OnlineUser from "./OnlineUser";

export default function UserList({
  users,
}) {

  return (

    <div className="h-full flex flex-col">

      {/* heading */}
      <div className="mb-5">

        <h2 className="text-sm uppercase tracking-widest text-gray-400">
          Online Users
        </h2>
      </div>

      {/* users */}
      <div className="space-y-3 overflow-y-auto">

        {users.length === 0 ? (

          <div className="text-gray-500 text-sm">
            No users online
          </div>

        ) : (

          users.map(
            (user, index) => (

              <OnlineUser
                key={index}
                user={user}
              />
            )
          )
        )}
      </div>
    </div>
  );
}