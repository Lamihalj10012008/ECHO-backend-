import MainLayout from "../layouts/MainLayout";
import "../styles/Profile.css";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <MainLayout>
      <div className="profile-page">

        <div className="profile-card">

          <div className="profile-avatar">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>

          <h2>{user?.full_name}</h2>

          <p>{user?.email}</p>

          <span className="role">
            {user?.role}
          </span>

        </div>

      </div>
    </MainLayout>
  );
}

export default Profile;