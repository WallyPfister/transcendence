import CustomAxios from "../Util/CustomAxios";
import Swal from "sweetalert2";
import { ProfileData } from "./ProfileInterface";

const friendButton = (event: React.MouseEvent, profileData: ProfileData) => {
    const target = event.target as HTMLButtonElement;
    if (profileData && !target.classList.contains('me')) {
        Swal.fire({
            text: (target.classList.contains('del') ? 'Remove' : 'Add') + ' as a friend?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'OK'
        }).then((res) => {
            if (res.isConfirmed) {
                if (target.classList.contains('del'))
                    CustomAxios.delete('/member/friend/' + profileData.name).then(() => {
                        Swal.fire('Complete!');
                        target.classList.remove('del');
                        target.classList.add('add');
                    })
                else if (target.classList.contains('add'))
                    CustomAxios.post('/member/friend/' + profileData.name).then((res) => {
                        Swal.fire('Complete!');
                        target.classList.remove('add');
                        target.classList.add('del');
                    })
                    .catch((err) => {
                        if (err.response.status === 404) 
                            Swal.fire('No such user');
                        else if (err.response.status === 409)
                            Swal.fire('Already friend');
                    });
            }
        });
    }
}

export default friendButton;