import React from 'react';

const Stories = () => {
  const stories = [
    {
      id: 1,
      type: 'create',
      image: 'IMG_7810.jpg',
      title: 'Tạo tin'
    },
    {
      id: 2,
      avatar: 'https://scontent.fsgn5-5.fna.fbcdn.net/v/t39.30808-1/469864732_2295104150845595_5236054652328865944_n.jpg?stp=cp0_dst-jpg_s40x40_tt6&_nc_cat=108&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeFDevbCVpOaZjXKEVyzEZusWrmrqba1zIlauauptrXMie305yOcm_1u21T4i2Agw9VMC-opebTTK-X7B2ro5eKd&_nc_ohc=42VuIy02XFMQ7kNvgGk_4o7&_nc_oc=Adk2kXAa98v8JmbfdXsR0V1hqW7SE1bvIWFjMM08ERsspDFNSIpNW2tyiTyXyZFsfzM&_nc_zt=24&_nc_ht=scontent.fsgn5-5.fna&_nc_gid=XxWW4EMx7jMqMN_C-8B5YA&oh=00_AYEmaQdQLlaRqiat2UmmNqhbMvSf6xIv8jo9WhAd6kFdKg&oe=67EA260F',
      name: 'Yến Hoàng'
    },
    {
      id: 3,
      avatar: 'https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-1/480699156_1852008362277900_2101197090274934605_n.jpg?stp=cp0_dst-jpg_s40x40_tt6&_nc_cat=101&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeHaZ0Chzr0xQCATcPkfGT-jsVfKWmXwClyxV8paZfAKXGMTn6RJv-D-QhA2Js6Jcbvkh1O6ZBC1vU6NzPZotpoW&_nc_ohc=8x5I2fMH1EUQ7kNvgGaI5y7&_nc_oc=AdkJOhWMsXGtak1j8tylxRs8ALME7MOFBhHmKx-ieggrOgRhS6-7djXkAlpOEgPvA7Y&_nc_zt=24&_nc_ht=scontent.fsgn5-14.fna&_nc_gid=XxWW4EMx7jMqMN_C-8B5YA&oh=00_AYEdUmGEYIfzWwjs7irLB0vCamcH5MEfPrPeOOrPWZb7tw&oe=67EA3A26',
      name: 'Thanh Hiền'
    },
    {
      id: 4,
      avatar: 'https://scontent.fsgn5-10.fna.fbcdn.net/v/t39.30808-1/350031677_188457927489704_658359158597550827_n.jpg?stp=cp0_dst-jpg_s40x40_tt6&_nc_cat=110&ccb=1-7&_nc_sid=e99d92&_nc_eui2=AeHGCTDBoxA8HCVLedw-9vPqGkqffbo_WQgaSp99uj9ZCMwCzhcgwd0iq77s4mMr46bmbdcr8IrU5Rp7GoCUtlMb&_nc_ohc=4ZwUkWw0ybUQ7kNvgETwYEM&_nc_oc=AdkHYtMDtgO87x5_EY1U3Z12Wn4b0BcdmMjxWv4R4MM9mgC-0Kep8U8svHl-2dZa0sI&_nc_zt=24&_nc_ht=scontent.fsgn5-10.fna&_nc_gid=dPY4PVwiQOnfZ7QpzTFQtg&oh=00_AYEIT2PiGQWUAcU0WyBmUI95BU_QOrQNthlwUByiRTRNIg&oe=67EA2B86',
      name: 'Hà Thụy Kim Thương'
    },
    {
      id: 5,
      avatar: 'https://scontent.fsgn5-3.fna.fbcdn.net/v/t1.6435-1/110062383_1118965381832945_9043834540577868627_n.jpg?stp=c28.28.805.805a_cp0_dst-jpg_s40x40_tt6&_nc_cat=104&ccb=1-7&_nc_sid=1d2534&_nc_eui2=AeFiA1Z58vVWUVeg0dqc6Vb91n3weisfjh_WffB6Kx-OH7hGrGsurfqjYHAag1s_zC19TuaHojIcUV00v-hJp7YL&_nc_ohc=37iBjDysZ1cQ7kNvgElQ1H0&_nc_oc=AdmTxh-lLHRZ84BolQ5NQu05_1WTxMEAYdczmGSI-DrKruY49jsS-U_YqihhD2rIXZ8&_nc_zt=24&_nc_ht=scontent.fsgn5-3.fna&_nc_gid=dPY4PVwiQOnfZ7QpzTFQtg&oh=00_AYEa5_EElU5zpUkjohXAQp-VlAs9SPEm5fkZKj-L-4THPw&oe=680BB2E5',
      name: 'Vũ Minh Kiệt'
    }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
      {stories.map((story) => (
        <div key={story.id} className="w-[112px] h-[200px] rounded-xl overflow-hidden flex-none relative cursor-pointer">
          {story.type === 'create' ? (
            <>
              <div
                className="w-full h-full overflow-hidden hover:scale-[1.02] hover:brightness-90 transition-all duration-300"
                style={{
                  backgroundImage: `url("${story.image}")`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              ></div>
              <div className="w-full absolute bottom-0">
                <div className="flex justify-center bg-white box-border px-4 pt-7 pb-3 relative">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2">
                    +
                  </div>
                  <span className="text-sm font-semibold">{story.title}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                className="rounded-full border-4 border-blue-600 w-10 h-10 m-3 absolute top-0 z-10"
                style={{
                  backgroundImage: `url("${story.avatar}")`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              ></div>
              <div className="w-full h-full hover:scale-[1.02] hover:brightness-90 transition-all duration-300 bg-gray-600"></div>
              <div className="flex w-full px-4 pt-7 pb-3 absolute bottom-0">
                <span className="text-sm font-semibold -ml-1">
                  {story.name}
                </span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default Stories; 