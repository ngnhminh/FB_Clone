import React, { useState } from 'react';
import { ChevronDown, Ellipsis } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { API_ENDPOINTS } from '../../config/api';
import { useToast } from '../../context/ToastContext';

const ProfileLeftSide = () => {
  const [showBioModal, setShowBioModal] = useState(false);
  const [showAllFriendsModal, setShowAllFriendsModal] = useState(false);
  const [bio, setBio] = useState('');
  const { currentUser, updateUser } = useUser();
  const { showSuccess, showError } = useToast();

  // Thêm mảng tên người dùng mẫu
  const sampleNames = [
    'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 
    'Phạm Thị D', 'Hoàng Văn E', 'Đỗ Thị F',
    'Vũ Văn G', 'Đặng Thị H', 'Bùi Văn I'
  ];

  // Thêm mảng ảnh ngẫu nhiên
  const randomAvatars = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4',
    'https://i.pravatar.cc/150?img=5',
    'https://i.pravatar.cc/150?img=6',
    'https://i.pravatar.cc/150?img=7',
    'https://i.pravatar.cc/150?img=8',
    'https://i.pravatar.cc/150?img=9',
    'https://i.pravatar.cc/150?img=10',
    'https://i.pravatar.cc/150?img=11',
    'https://i.pravatar.cc/150?img=12',
    'https://i.pravatar.cc/150?img=13',
    'https://i.pravatar.cc/150?img=14',
    'https://i.pravatar.cc/150?img=15',
    'https://i.pravatar.cc/150?img=16',
    'https://i.pravatar.cc/150?img=17',
    'https://i.pravatar.cc/150?img=18',
    'https://i.pravatar.cc/150?img=19',
    'https://i.pravatar.cc/150?img=20'
  ];

  // Tạo danh sách bạn bè mẫu
  const allFriends = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    name: `Người dùng ${index + 1}`,
    avatar: randomAvatars[index % randomAvatars.length],
    mutualFriends: Math.floor(Math.random() * 50) + 1
  }));

  // Hàm lấy ảnh ngẫu nhiên
  const getRandomAvatar = (index) => {
    return randomAvatars[index % randomAvatars.length];
  };

  // Hàm tạo số ngẫu nhiên cho bạn bè chung
  const getRandomMutualFriends = () => Math.floor(Math.random() * 50) + 1;

  const handleAddBio = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.PROFILE}/update-bio`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ bio })
      });

      if (!response.ok) {
        throw new Error('Không thể cập nhật tiểu sử');
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      showSuccess('Cập nhật tiểu sử thành công');
      setShowBioModal(false);
    } catch (error) {
      showError(error.message);
    }
  };

  return (
    <div className='block basis-[360px] box-border m-[8px] max-w-[680px] min-x-0 grow-18 relative'>
      <div className='block bg-white rounded-xl shadow-sm'>
        <div className='block mb-[16px]'>
          <div className='block overflow-hidden w-[424.888px] relative'>
            <div className='flex flex-col max-w-full pb-[4px] pt-[20px] box-border relative'>
              <div className='flex flex-col grow-1 min-h-0 relative'>
                <div className='flex flex-col max-w-full px-[16px] box-border relative'>
                  <div className='flex flex-col -my-[6px]'>
                    <div className='block my-[6px]'>
                      <span className='block text-[20px] font-bold leading-6 max-w-full min-w-0 break-words text-gray-900'>Giới thiệu</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='block mb-[20px] relative'>
              <div className='flex items-stretch justify-between -m-[6px] px-[16px] pt-[16px]'>
                <div className='flex flex-col grow-1 p-[6px] max-w-full'>
                  <div className='flex flex-col justify-center'>
                    <div className='flex justify-center px-[12px] h-[36px]'>
                      <button 
                        onClick={() => setShowBioModal(true)}
                        className='btn btn-soft hover:bg-gray-100 rounded-lg -mx-[3px] w-[374.888px] text-gray-700'
                      >
                        <span className='text-[15px] font-semibold leading-[20px] break-words'>Thêm tiểu sử</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex items-stretch justify-between -m-[6px] px-[16px] pt-[16px]'>
                <div className='flex flex-col grow-1 max-w-full min-w-0 p-[6px] box-border'>
                  <ul className='block'>
                    <div className='flex items-stretch justify-start -m-[6px] box-border'>
                      <div className='flex flex-col p-[6px]'>
                        <img height="20" width="20" className='grayscale opacity-50'
                          src="https://static.xx.fbcdn.net/rsrc.php/v4/yS/r/jV4o8nAgIEh.png?_nc_eui2=AeG_vJ1UZtE4n9fjF0E3SKj1oQ2CZRkSj5OhDYJlGRKPkw3HaovaR4yLrnyBFnqieGe8SPt1q8XKDbLTm-AwmFKT"/>
                      </div>
                      <div className='flex flex-col grow-1 p-[6px] box-border'>
                        <div className='flex flex-col -my-[5px]'>
                          <div className='block my-[5px]'>
                            <span className='block break-words text-start max-w-full min-w-0 text-gray-700'>
                              Đã học tại &nbsp;
                              <a href="#" className='inline text-[15px] hover:underline font-semibold text-start break-words text-blue-600'>
                                Ngô Quyền High School
                              </a>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex items-stretch justify-start -m-[6px] box-border'>
                      <div className='flex flex-col p-[6px]'>
                        <img className='grayscale opacity-50' alt="" height="20" width="20" 
                          src="https://static.xx.fbcdn.net/rsrc.php/v4/yj/r/LPnnw6HJjJT.png?_nc_eui2=AeHHDwjZNtT1Og2nptlnppCg1cVeDE3fb8_VxV4MTd9vzyQEAZ0XYxWtQrDE3iG_NfvQajcWXXMrwS8Kw9yKoiQl"/>
                      </div>
                      <div className='flex flex-col grow-1 p-[6px] box-border'>
                        <div className='flex flex-col -my-[5px]'>
                          <div className='block my-[5px]'>
                            <span className='block break-words text-start max-w-full min-w-0'>
                              <a href="#" 
                                className='inline text-[15px] font-semibold text-start break-words text-blue-600 hover:underline'>
                                minhhigh_
                              </a>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ul>
                  <div className='block mt-[12px]'>
                    <div className='inline-flex justify-center w-[392.888px]'>
                      <button className='btn btn-soft rounded-lg hover:bg-gray-100 px-[12px] h-[36px] w-[374.888px] text-gray-700'>
                        <span className='block text-[15px] font-semibold break-words'>Chỉnh sửa chi tiết</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='block bg-white rounded-xl shadow-sm mt-4'>
        <div className='block mb-[16px]'>
          <div className='block w-[424.888px] overflow-hidden relative'>
            <div className='flex flex-col pb-[4px] pt-[20px] max-w-full shrink-0 relative'>
              <div className='flex flex-col grow-1'>
                <div className='flex flex-col px-[16px] box-border'>
                  <div className='flex flex-col -my-[6px]'>
                    <div className='block my-[6px]'>
                      <span className='block max-w-full min-w-0 break-words'>
                        <div className='flex items-end justify-between'>
                          <div className='flex flex-col grow-1 relative'>
                            <a href="#" className='hover:underline text-[20px] font-bold leading-[24px] text-gray-900'>Bạn bè</a>
                            <span className='text-md font-normal text-gray-600'>215 người bạn</span>
                          </div>
                          <div className='flex flex-col self-start justify-center ml-[8px]'>
                            <button
                              onClick={() => setShowAllFriendsModal(true)}
                              className='btn btn-ghost text-[15px] hover:bg-gray-100 rounded-md'
                            >
                              <span className='text-blue-600'>Xem tất cả bạn bè</span>
                            </button>
                          </div>
                        </div>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='block mb-[20px]'>
              <div className='flex items-stretch justify-between -m-[6px] px-[16px] pt-[16px] box-border relative'>
                <div className='flex flex-col grow-1 max-w-full min-w-0 p-[6px] box-border relative'>
                  <div className='grid grid-cols-3 grid-rows-3 -mx-[4px] rounded-xl overflow-hidden'>
                    {[...Array(9)].map((_, index) => (
                      <div key={index} className='flex w-[132.288px] mb-[4px]'>
                        <div className='block mr-[4px] overflow-hidden relative group'>
                          <a href="#" className='block pb-[128.288px] w-[128.288px] relative'>
                            <div className='block absolute top-0 bottom-0 right-0 left-0'>
                              <img 
                                className='size-[128.288px] object-cover transition-transform duration-300 group-hover:scale-110'
                                src={getRandomAvatar(index)}
                                alt={sampleNames[index]} 
                              />
                              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <p className="text-white text-sm font-medium truncate">{sampleNames[index]}</p>
                              <p className="text-white/80 text-xs">{getRandomMutualFriends()} bạn chung</p>
                            </div>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xem tất cả bạn bè */}
      {showAllFriendsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Tất cả bạn bè</h2>
              <button
                onClick={() => setShowAllFriendsModal(false)}
                className="text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-1"
              >
                Đóng
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {allFriends.map(friend => (
                <div key={friend.id} className="flex flex-col items-center bg-gray-50 rounded-lg p-3">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-20 h-20 rounded-full object-cover mb-2"
                  />
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{friend.name}</p>
                    <p className="text-xs text-gray-500">{friend.mutualFriends} bạn chung</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm tiểu sử */}
      {showBioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <h2 className="text-xl font-bold mb-4">Thêm tiểu sử</h2>
            <textarea
              className="w-full h-32 p-2 border rounded-lg mb-4 resize-none"
              placeholder="Viết gì đó về bản thân..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowBioModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleAddBio}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      <footer aria-label='Facebook' className='block mt-4 text-gray-600'>
        <span className='block text-[13px] font-semibold break-words max-w-full min-w-0'>
          <ul className='inline space-x-0.5'>
            <li className='inline'>
              <a href="#" className='hover:underline'>Quyền riêng tư</a>
              <span>.</span>
            </li>
            <li className='inline'>
              <a href="#" className='hover:underline'>Điều khoản</a>
              <span>.</span>
            </li>
            <li className='inline'>
              <a href="#" className='hover:underline'>Quảng Cáo</a>
              <span>.</span>
            </li>
            <li className='inline'>
              <a href="#" className='hover:underline'>Lựa Chọn Quảng cáo</a>
              <span>.</span>
            </li>
            <li className='inline'>
              <a href="#" className='hover:underline'>Cookie</a>
              <span>.</span>
            </li>
            <li className='inline'>
              <a href="#" className='hover:underline'>Xem thêm</a>
              <span>.</span>
            </li>
          </ul>
          Meta © 2025
        </span>
      </footer>
    </div>
  );
};

export default ProfileLeftSide; 