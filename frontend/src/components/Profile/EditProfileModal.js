import React, { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../../config/api';
import Cropper from 'react-easy-crop';

const EditProfileModal = ({
  show,
  onHide,
  userData,
  onProfileUpdate,
  onSuccess,
  onError
}) => {
  // Personal information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Image editing
  const [avatar, setAvatar] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  // Crop state
  const [avatarCrop, setAvatarCrop] = useState({ x: 0, y: 0 });
  const [coverCrop, setCoverCrop] = useState({ x: 0, y: 0 });
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [coverZoom, setCoverZoom] = useState(1);
  const [avatarCroppedArea, setAvatarCroppedArea] = useState(null);
  const [coverCroppedArea, setCoverCroppedArea] = useState(null);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [errors, setErrors] = useState({});

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});

  // Initialize form with user data
  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setBio(userData.bio || '');
      setEmail(userData.email || '');
      setGender(userData.gender || '');
      setDay(userData.day || '');
      setMonth(userData.month || '');
      setYear(userData.year || '');

      // Set image previews with cache busting
      const timestamp = new Date().getTime();

      let avatarUrl = '/default-imgs/avatar.png';
      if (userData.avatar) {
        if (userData.avatar.startsWith('http')) {
          avatarUrl = userData.avatar.includes('?')
            ? `${userData.avatar}&t=${timestamp}`
            : `${userData.avatar}?t=${timestamp}`;
        } else {
          avatarUrl = `${API_ENDPOINTS.BASE_URL}${userData.avatar.startsWith('/') ? '' : '/'}${userData.avatar}?t=${timestamp}`;
        }
      }

      let coverUrl = '/default-imgs/cover.jpg';
      if (userData.coverPhoto) {
        if (userData.coverPhoto.startsWith('http')) {
          coverUrl = userData.coverPhoto.includes('?')
            ? `${userData.coverPhoto}&t=${timestamp}`
            : `${userData.coverPhoto}?t=${timestamp}`;
        } else {
          coverUrl = `${API_ENDPOINTS.BASE_URL}${userData.coverPhoto.startsWith('/') ? '' : '/'}${userData.coverPhoto}?t=${timestamp}`;
        }
      }

      console.log('Setting avatar preview URL:', avatarUrl);
      console.log('Setting cover preview URL:', coverUrl);

      setAvatarPreview(avatarUrl);
      setCoverPreview(coverUrl);
    }
  }, [userData, show]);

  // Reset form when modal is closed
  useEffect(() => {
    if (!show) {
      // Clean up blob URLs
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      if (coverPreview && coverPreview.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreview);
      }
    }
  }, [show, avatarPreview, coverPreview]);

  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = 'Tên là bắt buộc';
    if (!lastName.trim()) newErrors.lastName = 'Họ là bắt buộc';
    if (!email.trim()) newErrors.email = 'Email là bắt buộc';
    if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email không hợp lệ';

    // Date validation
    if (day && month && year) {
      const birthDate = new Date(`${month} ${day}, ${year}`);
      if (isNaN(birthDate.getTime())) {
        newErrors.date = 'Ngày sinh không hợp lệ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    if (!newPassword.trim()) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (!confirmNewPassword.trim()) {
      newErrors.confirmNewPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (confirmNewPassword !== newPassword) {
      newErrors.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to create a blob from a cropped image
  const createCroppedImage = useCallback(async (imageSrc, pixelCrop, rotation = 0) => {
    if (!pixelCrop || !pixelCrop.width || !pixelCrop.height) {
      console.error('Invalid crop area', pixelCrop);
      return null;
    }

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = imageSrc;

      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set dimensions
          canvas.width = pixelCrop.width;
          canvas.height = pixelCrop.height;

          // Draw the cropped image
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw the image at the correct position
          ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
          );

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                console.error('Canvas to Blob conversion failed');
                reject(new Error('Failed to create image blob'));
                return;
              }
              resolve(blob);
            },
            'image/jpeg',
            0.95
          );
        } catch (err) {
          console.error('Error in canvas operations:', err);
          reject(err);
        }
      };

      image.onerror = (err) => {
        console.error('Error loading image:', err);
        reject(new Error('Failed to load image'));
      };
    });
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const blobUrl = URL.createObjectURL(file);
      setAvatarPreview(blobUrl);
      setActiveTab('avatar');
      // Reset crop area when changing image
      setAvatarCrop({ x: 0, y: 0 });
      setAvatarZoom(1);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPhoto(file);
      const blobUrl = URL.createObjectURL(file);
      setCoverPreview(blobUrl);
      setActiveTab('cover');
      // Reset crop area when changing image
      setCoverCrop({ x: 0, y: 0 });
      setCoverZoom(1);
    }
  };

  // Crop complete handlers
  const onAvatarCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    console.log('Avatar crop complete:', croppedAreaPixels);
    if (croppedAreaPixels && croppedAreaPixels.width > 0 && croppedAreaPixels.height > 0) {
      setAvatarCroppedArea(croppedAreaPixels);
    } else {
      console.error('Invalid avatar crop area:', croppedAreaPixels);
    }
  }, []);

  const onCoverCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    console.log('Cover crop complete:', croppedAreaPixels);
    if (croppedAreaPixels && croppedAreaPixels.width > 0 && croppedAreaPixels.height > 0) {
      setCoverCroppedArea(croppedAreaPixels);
    } else {
      console.error('Invalid cover crop area:', croppedAreaPixels);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('userId', userData.id);
      formData.append('name', `${firstName} ${lastName}`);
      formData.append('email', email);
      formData.append('bio', bio);
      formData.append('gender', gender);
      formData.append('day', day);
      formData.append('month', month);
      formData.append('year', year);

      // Process avatar image if it exists and has been cropped
      if (avatar && avatarPreview && avatarCroppedArea) {
        try {
          const croppedAvatarBlob = await createCroppedImage(
            avatarPreview,
            avatarCroppedArea
          );

          if (croppedAvatarBlob) {
            formData.append('avatar', croppedAvatarBlob, 'avatar.jpg');
            console.log('Avatar blob created successfully');
          } else {
            console.log('Using original avatar file as fallback');
            formData.append('avatar', avatar);
          }
        } catch (error) {
          console.error('Error cropping avatar:', error);
          // Fallback to original file if cropping fails
          console.log('Using original avatar file after error');
          formData.append('avatar', avatar);
        }
      } else if (avatar) {
        // Use original file if no cropping was done
        console.log('Using original avatar file (no cropping)');
        formData.append('avatar', avatar);
      }

      // Process cover image if it exists and has been cropped
      if (coverPhoto && coverPreview && coverCroppedArea) {
        try {
          console.log('Attempting to crop cover photo with:', coverCroppedArea);
          const croppedCoverBlob = await createCroppedImage(
            coverPreview,
            coverCroppedArea
          );

          if (croppedCoverBlob) {
            console.log('Cover photo blob created successfully');
            formData.append('coverPhoto', croppedCoverBlob, 'cover.jpg');
          } else {
            console.log('Using original cover photo as fallback');
            formData.append('coverPhoto', coverPhoto);
          }
        } catch (error) {
          console.error('Error cropping cover photo:', error);
          // Fallback to original file if cropping fails
          console.log('Using original cover photo after error');
          formData.append('coverPhoto', coverPhoto);
        }
      } else if (coverPhoto) {
        // Use original file if no cropping was done
        console.log('Using original cover photo (no cropping)');
        formData.append('coverPhoto', coverPhoto);
      }

      // Submit the form data
      await submitFormData(formData);
    } catch (error) {
      console.error('Error preparing form data:', error);
      if (onError) onError('An error occurred while preparing your profile data');
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('userId', userData.id);
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);

      const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PROFILE}/update-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật mật khẩu');
      }

      if (onSuccess) {
        onSuccess('Mật khẩu đã được cập nhật thành công');
      }

      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordErrors({});
      setActiveTab('personal');
    } catch (error) {
      if (onError) {
        onError(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitFormData = async (formData) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PROFILE}/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();

      // Create updated user data object
      const updatedUserData = {
        ...userData,
        firstName,
        lastName,
        email,
        bio,
        gender,
        day,
        month,
        year,
        avatar: updatedProfile.avatar,
        coverPhoto: updatedProfile.coverPhoto
      };

      // Call the onProfileUpdate callback with the updated data
      if (onProfileUpdate) {
        onProfileUpdate(updatedUserData);
      }

      if (onSuccess) {
        onSuccess('Profile updated successfully');
      }

      onHide();
    } catch (error) {
      console.error('Error updating profile:', error);
      if (onError) {
        onError(error.message || 'Failed to update profile');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${show ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onHide}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Chỉnh sửa hồ sơ</h3>
          <button
            onClick={onHide}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <span className="sr-only">Đóng</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('personal')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'personal'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'password'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Đổi mật khẩu
              </button>
              <button
                onClick={() => setActiveTab('avatar')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'avatar'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ảnh đại diện
              </button>
              <button
                onClick={() => setActiveTab('cover')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cover'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ảnh bìa
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === 'personal' && (
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới thiệu</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">Hãy chia sẻ một chút về bản thân</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={gender === 'Male'}
                        onChange={() => setGender('Male')}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">Nam</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={gender === 'Female'}
                        onChange={() => setGender('Female')}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">Nữ</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="Other"
                        checked={gender === 'Other'}
                        onChange={() => setGender('Other')}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">Khác</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                  <div className="grid grid-cols-3 gap-4">
                    <select
                      value={day}
                      onChange={(e) => setDay(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Ngày</option>
                      {[...Array(31)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                    <select
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Tháng</option>
                      {['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'].map((m, i) => (
                        <option key={i} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Năm</option>
                      {[...Array(100)].map((_, i) => {
                        const yearOption = new Date().getFullYear() - i;
                        return <option key={yearOption} value={yearOption}>{yearOption}</option>;
                      })}
                    </select>
                  </div>
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      passwordErrors.confirmNewPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {passwordErrors.confirmNewPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmNewPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </form>
            )}

            {activeTab === 'avatar' && (
              <div className="space-y-6">
                <div>
                  <h5 className="text-lg font-medium text-gray-900 mb-4">Ảnh đại diện hiện tại</h5>
                  {!avatar && (
                    <img
                      src={avatarPreview}
                      alt="Ảnh đại diện hiện tại"
                      className="w-32 h-32 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/default-imgs/avatar.png';
                      }}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tải lên ảnh đại diện mới</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {avatar && (
                  <>
                    <div className="relative h-[300px] w-full">
                      <Cropper
                        image={avatarPreview}
                        crop={avatarCrop}
                        zoom={avatarZoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setAvatarCrop}
                        onCropComplete={onAvatarCropComplete}
                        onZoomChange={setAvatarZoom}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thu phóng: {avatarZoom.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={avatarZoom}
                        onChange={(e) => setAvatarZoom(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'cover' && (
              <div className="space-y-6">
                <div>
                  <h5 className="text-lg font-medium text-gray-900 mb-4">Ảnh bìa hiện tại</h5>
                  {!coverPhoto && (
                    <img
                      src={coverPreview}
                      alt="Ảnh bìa hiện tại"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/default-imgs/cover.jpg';
                      }}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tải lên ảnh bìa mới</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {coverPhoto && (
                  <>
                    <div className="relative h-[250px] w-full">
                      <Cropper
                        image={coverPreview}
                        crop={coverCrop}
                        zoom={coverZoom}
                        aspect={2.5}
                        showGrid={false}
                        onCropChange={setCoverCrop}
                        onCropComplete={onCoverCropComplete}
                        onZoomChange={setCoverZoom}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thu phóng: {coverZoom.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={coverZoom}
                        onChange={(e) => setCoverZoom(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button
            onClick={onHide}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
