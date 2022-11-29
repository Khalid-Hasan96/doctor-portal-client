import { async } from '@firebase/util';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Loading from '../../../Shared/Loading/Loading';

const AddDoctor = () => {
    const imgHostingKey = process.env.REACT_APP_imgbb_key;
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { data: specialties, isLoading } = useQuery({
        queryKey: ['specialty'],
        queryFn: async () => {
            const res = await fetch('http://localhost:5000/appointmentSpecialty');
            const data = res.json();
            return data;
        }
    })

    const handleAddDoctor = data => {
        const image = data.img[0]
        const formData = new FormData();
        formData.append('image', image);

        const url = `https://api.imgbb.com/1/upload?key=${imgHostingKey}`;
        fetch(url, {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(imageData => {
                if (imageData.success) {
                    const doctor = {
                        name: data.name,
                        email: data.email,
                        specialty: data.specialty,
                        image: imageData.data.url
                    }
                    fetch('http://localhost:5000/doctors', {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/json',
                            authorization: `bearer ${localStorage.getItem('accessToken')}`
                        },
                        body: JSON.stringify(doctor)
                    })
                        .then(res => res.json())
                        .then(result => {
                            console.log(result);
                            toast(`${data.name} added successfully`);
                            navigate('/dashboard/managedoctors')
                        })

                }
            })

    }

    if (isLoading) {
        return <Loading></Loading>
    }
    return (
        <div className='w-96 p-7'>
            <h2 className='text-4xl'>Add a New Doctor</h2>
            <form onSubmit={handleSubmit(handleAddDoctor)}>
                <div className="form-control w-full max-w-xs">
                    <label className="label"><span className="label-text">Name</span></label>
                    <input type='text' {...register("name", {
                        required: 'Name is required'
                    })} className="input input-bordered w-full" />
                    {errors.name && <p className='text-error'>{errors.name.message}</p>}
                </div>
                <div className="form-control w-full max-w-xs">
                    <label className="label"><span className="label-text">Email</span></label>
                    <input type='email' {...register("email", {
                        required: true
                    })} className="input input-bordered w-full" />
                    {errors.email && <p className='text-error'>{errors.email.message}</p>}
                </div>
                <div className="form-control w-full max-w-xs">
                    <label className="label"><span className="label-text">Specialty</span></label>
                    <select className="select select-bordered w-full max-w-xs" {...register("specialty", {
                        required: true
                    })}>

                        {
                            specialties.map(specialty => <option
                                key={specialty._id}
                                value={specialty.name}
                            >{specialty.name}</option>)
                        }

                    </select>
                </div>
                <div className="form-control w-full max-w-xs">
                    <label className="label"><span className="label-text">Photo</span></label>
                    <input type='file' {...register("img", {
                        required: 'Photo is required'
                    })} className="input input-bordered w-full" />
                    {errors.img && <p className='text-error'>{errors.img.message}</p>}
                </div>
                {/* {signUpError && <p className='text-error'>{signUpError}</p>} */}
                <input className='btn btn-accent w-full mt-3' value="Add Doctor" type="submit" />
            </form>
        </div>
    );
};

export default AddDoctor;