
import { ChevronDown} from "lucide-react";

const Sidebar = () => {

  return (
    <aside className="flex flex-col h-[calc(100vh-56px)] relative scrollbar">
      <div className="flex flex-col basis-full overflow-x-hidden overflow-y-auto overscroll-y-contain  relative ">
        <div className="flex flex-col justify-between  grow-1 mt-[16px] relative">
          
          <div className="block grow-1">
            {/* Tính năng */}
            <div className=" flex flex-col w-full px-2 cursor-pointer">
                  <a href="/profile">
                    <div className="flex flex-col justify-center h-[52px] pl-2 hover:bg-base-100 rounded-xl ">
                      <div className="flex gap-2 ">
                        <img src="IMG_7810.jpg" alt="avatar" className=" size-[36px] inline-block rounded-full object-cover" /> 
                        <span> Hải Minh</span>
                      </div>
                    </div>
                  </a>
                  <div className="flex flex-col justify-center h-[52px] pl-2 hover:bg-base-100 rounded-xl ">
                    <div className="flex gap-2 ">
                    <div className="w-9 h-9 bg-no-repeat bg-cover" style={{
                        backgroundImage: 'url("https://static.xx.fbcdn.net/rsrc.php/v4/yw/r/-GSeaf19sqF.png")',
                        backgroundPosition: "0px -328px"
                      }}>
                      </div>
                      <span>Bạn bè</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center h-[52px] pl-2 hover:bg-base-100 rounded-xl ">
                    <div className="flex gap-2 ">
                    <div className="w-9 h-9 bg-no-repeat bg-cover" style={{
                        backgroundImage: 'url("https://static.xx.fbcdn.net/rsrc.php/v4/yw/r/-GSeaf19sqF.png")',
                        backgroundPosition: "0px -435px"
                      }}>
                      </div>
                      <span>Marketplace</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center h-[52px] pl-2 hover:bg-base-100 rounded-xl ">
                    <div className="flex gap-2 ">
                    <div className="w-9 h-9 bg-no-repeat bg-cover" style={{
                        backgroundImage: 'url("https://static.xx.fbcdn.net/rsrc.php/v4/yw/r/-GSeaf19sqF.png")',
                        backgroundPosition: "0px -471px"
                      }}>
                      </div>
                      <span>  Kỷ niệm</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center h-[52px] pl-2 hover:bg-base-100 rounded-xl ">
                    <div className="flex gap-2 ">
                    <div className="w-9 h-9 bg-no-repeat bg-cover" style={{
                        backgroundImage: 'url("https://static.xx.fbcdn.net/rsrc.php/v4/yw/r/-GSeaf19sqF.png")',
                        backgroundPosition: "0px -182px"
                      }}>
                      </div>
                      <span> Đã lưu</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center h-[52px] pl-2 hover:bg-base-100 rounded-xl ">
                    <div className="flex gap-2 ">
                    <div className="w-9 h-9 bg-no-repeat bg-cover" style={{
                        backgroundImage: 'url("https://static.xx.fbcdn.net/rsrc.php/v4/yw/r/-GSeaf19sqF.png")',
                        backgroundPosition: "0px -40px"
                      }}>
                      </div>
                      <span>  Nhóm</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center h-[52px] pl-2 hover:bg-base-100 rounded-xl ">
                    <div className="flex gap-2 ">
                    <div className="w-9 h-9 bg-no-repeat bg-cover" style={{
                        backgroundImage: 'url("https://static.xx.fbcdn.net/rsrc.php/v4/yw/r/-GSeaf19sqF.png")',
                        backgroundPosition: "0px -545px"
                      }}>
                      </div>
                      <span> Video</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center h-[52px] pl-2 hover:bg-base-100 rounded-xl ">
                    <div className="flex gap-2 ">
                    <div className="w-9 h-9 bg-no-repeat bg-cover" style={{
                        backgroundImage: 'url("https://static.xx.fbcdn.net/rsrc.php/v4/yb/r/eECk3ceTaHJ.png")',
                        
                      }}>
                      </div>
                      <span> Bảng feed</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center h-[52px] pl-2 hover:bg-base-100 rounded-xl ">
                    <div className="flex gap-2 ">
                      <div className="size-[36px] rounded-full bg-base-100 flex items-center justify-center">
                        <ChevronDown />
                      </div>
                      <span>Xem thêm</span>
                    </div>
                  </div>
              </div>
            {/* Đường kẻ ngang  */}
              <div className=" py-2 pl-3">
                <div className="border-t border-gray-500 w-full"></div>
              </div>
            {/* Lối tắt */}
              <div className=" flex flex-col w-full px-2">
                <div className=" flex flex-col justify-center p-1">
                  <div className="group flex items-center justify-between ">
                    <span className=" font-bold">Lối tắt của bạn</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer hover:bg-gray-700 box-border p-1 rounded-lg">
                      <a href="/" className=" text-blue-400 ">Chỉnh sửa</a>
                    </span>
                  </div>
                </div>
                <div className=" flex flex-col justify-center p-2 rounded-xl hover:bg-base-100 cursor-pointer">
                  <div className="flex items-center gap-3 ">
                      <img 
                        className=" size-[36px] rounded-lg"
                        src="https://scontent-sea1-1.xx.fbcdn.net/v/t39.30808-6/411922948_1531484987699478_1235640146891792105_n.png?stp=c510.0.1028.1028a_cp0_dst-png_s50x50&_nc_cat=103&ccb=1-7&_nc_sid=1760b9&_nc_eui2=AeE3QWytXRMIeoud5LIc1AZEvrA6-V_qWW2-sDr5X-pZbdNEEb6WB7PcRx7uaFkCHhez5mUBcD-1Ba2fDRxFdswF&_nc_ohc=7ErRlteMkJwQ7kNvgGvx6ja&_nc_oc=AdmNSjYQHolV_-gOrGz30Mn_6oMbaTAqs8t9JdZ7CR3VDfRYhexLOBOANfnl1PM1s-U&_nc_zt=23&_nc_ht=scontent-sea1-1.xx&_nc_gid=0xKqIODGGQga53msQ_NrBA&oh=00_AYGc-JTjH166YdzuTJ_IEiXVOuf60kwqvzV3c5Sfr8-nvg&oe=67E8C329" alt="jpg" />
                      <span>Cộng đồng UpWork Việt Nam</span>
                  </div>
                </div>
                <div className=" flex flex-col justify-center p-2 rounded-xl hover:bg-base-100 cursor-pointer">
                  <div className="flex items-center gap-3 ">
                      <img 
                        className=" size-[36px] rounded-lg"
                        src="https://scontent-sea1-1.xx.fbcdn.net/v/t39.30808-6/453485295_799272749042261_5200771887793707991_n.jpg?stp=c289.0.249.249a_cp0_dst-jpg_s50x50_tt6&_nc_cat=102&ccb=1-7&_nc_sid=1760b9&_nc_eui2=AeEyqPW-XTUe9_MWEZOszCFtM9ezSi_089gz17NKL_Tz2MsjpJr-njun76Vj-7D_b8IKngOsLfLwI1tah6LbGy7s&_nc_ohc=AIG-3ir9tvIQ7kNvgE1CxKJ&_nc_oc=Admyz0gMsWGeYGl9hFNkJHXBzSw6mmwPgF_nq8yEfzJoDfI5URwGuwM_9AV3Hfd4usE&_nc_zt=23&_nc_ht=scontent-sea1-1.xx&_nc_gid=_tBXIHSSZwrnPXjeCtxDOA&oh=00_AYGcfCIuVZPLsU-JNfNLer6Z-NLcRT0AUJBplAtHT5Ekvw&oe=67E8C282" alt="sgu" />
                      <span>Cộng đồng sinh viên SGU</span>
                  </div>
                </div>
                <div className=" flex flex-col justify-center p-2 rounded-xl hover:bg-base-100 cursor-pointer">
                  <div className="flex items-center gap-3 ">
                      <img 
                        className=" size-[36px] rounded-lg"
                        src="https://scontent-sea1-1.xx.fbcdn.net/v/t39.2081-6/115803868_1632927190200218_7726110434222976102_n.png?stp=c6.6.31.31a_dst-png_p36x36&_nc_cat=1&ccb=1-7&_nc_sid=ed3f67&_nc_eui2=AeHWRfMwT51IFQ7eYQp941N0orp2vdDVCWSiuna90NUJZKIio_ei8f-OeevjJ9b0hGtkDRv2nMt2-EueO0AHn6pY&_nc_ohc=v4oc0deTtUsQ7kNvgFlhDAl&_nc_oc=AdmSn2-lDVo4yPJWS4EhYkEO6pvJPy7wRw2EYc0pXLCU1G20zxNnkhJY49qT2kH8boM&_nc_zt=14&_nc_ht=scontent-sea1-1.xx&_nc_gid=0xKqIODGGQga53msQ_NrBA&oh=00_AYHAaBFawq2U3-tEfg8lxIZXz5Qf8-NZyncofPLG7Jvtuw&oe=67E8AD58" alt="sgu" />
                      <span>Cờ caro</span>
                  </div>
                </div>
                <div className=" flex flex-col justify-center p-2 rounded-xl hover:bg-base-100 cursor-pointer">
                  <div className="flex items-center gap-3 ">
                      <img 
                        className=" size-[36px] rounded-lg"
                        src="https://scontent-sea1-1.xx.fbcdn.net/v/t39.30808-6/447843169_122043041345420024_8407522355823862737_n.png?stp=cp0_dst-png_s50x50&_nc_cat=1&ccb=1-7&_nc_sid=9bae5a&_nc_eui2=AeE6TAWC1Qu6KteoxV7w831hTPHzaqaXuLFM8fNqppe4sXzZMRgMvtGI6E5yQ7FNaWwiGbOe9Mc6RvXQxVTwUw5q&_nc_ohc=GxNLnk0Z3dQQ7kNvgH1EyDo&_nc_oc=AdkZnBBAJsgaSJVXcndGzv0aYPZPDp0FRcnzCb5JdlY4MM1DX2-CwT7LJLx8PBx7gv8&_nc_zt=23&_nc_ht=scontent-sea1-1.xx&_nc_gid=0xKqIODGGQga53msQ_NrBA&oh=00_AYEftYufGgtjmf08BRtP-NQFw4gQh7AuMkHAjJpAbgMvhw&oe=67E8A98C" alt="sgu" />
                      <span>SGU_Mobile Nâng cao</span>
                  </div>
                </div>


              </div>
          </div>

          <div className="block p-[16px] font-[Segoe UI Historic] text-[13px] font-normal break-words ">
            <ul className=" inline">
              <li className="text-left list-none inline break-words">Quyền riêng tư</li>
              <li className="text-left list-none inline break-words">Điều khoản</li>
              <li className="text-left list-none inline break-words">Quảng cáo</li>
              <li className="text-left list-none inline break-words">Lựa chọn quảng cáo</li>
              <li className="text-left list-none inline break-words">Cookie</li>
              <li className="text-left list-none inline break-words">Xem thêm</li>
            </ul>
            Meta © 2025
          </div>

      </div>
    </div>
  </aside>


  )
}

export default Sidebar