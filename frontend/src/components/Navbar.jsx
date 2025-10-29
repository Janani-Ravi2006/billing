import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ username, onLogout }) {
  const menuItems = [
    {name:"Dashboard", path: "/"},
    { name: "Category", path: "/category" },
    { name: "Products", path: "/products" },
    { name: "Purchase", path: "/purchase" },
    { name: "Stock", path: "/stock" },
    { name: "Billing", path: "/billing" },
    { name: "Accounts", path: "/accounts" },
    { name: "Executive Salary", path: "/executive-salary" },
    { name: "Packers Salary", path: "/packer-entry" },
    { name: "Product Sales Report", path: "/product-sales-report" },
    { name: "Executive Report", path: "/executive-report" },
    { name: "Package Section Report", path: "/package-section-report" },
    { name: "Over Dues", path: "/over-dues" },
    { name: "Transactions", path: "/transactions" },
  ];

  return (
    <nav className="flex flex-col justify-between bg-teal-500 text-white w-56 h-screen px-4 py-6 shadow-lg font-[Poppins]">
      {/* Menu Items */}
      <div className="flex flex-col gap-2 flex-1">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="w-full text-left hover:bg-teal-600 px-3 py-2 rounded-lg text-base font-medium transition"
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Bottom - Username + Logout */}
      <div className="flex flex-col items-center mt-6">
        <span className="font-semibold text-base">{username}</span>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-base font-medium text-white transition mt-2"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}


// import React from "react";
// import { Link } from "react-router-dom";

// export default function Navbar({ username, onLogout }) {
//   const menuItems = [
//     { name: "Dashboard", path: "/" },
//     { name: "Category", path: "/category" },
//     { name: "Products", path: "/products" },
//     { name: "Purchase", path: "/purchase" },
//     { name: "Stock", path: "/stock" },
//     { name: "Billing", path: "/billing" },
//     { name: "Accounts", path: "/accounts" },
//     { name: "Executive Salary", path: "/executive-salary" },
//     { name: "Packers Salary", path: "/packer-entry" },
//     { name: "Product Sales Report", path: "/product-sales-report" },
//     { name: "Executive Report", path: "/executive-report" },
//     { name: "Package Section Report", path: "/package-section-report" },
//     { name: "Over Dues", path: "/over-dues" },
//     { name: "Transactions", path: "/transactions" },
//   ];

//   return (
//     <nav className="flex flex-col justify-between bg-teal-500 text-white w-56 h-screen shadow-lg font-[Poppins] overflow-hidden">
//       {/* Menu Items - No Scroll */}
//       <div className="flex flex-col gap-2 px-4 py-6 overflow-hidden">
//         {menuItems.map((item, index) => (
//           <Link
//             key={index}
//             to={item.path}
//             className="w-full text-left hover:bg-teal-600 px-3 py-2 rounded-lg text-base font-medium transition"
//           >
//             {item.name}
//           </Link>
//         ))}
//       </div>

//       {/* Bottom - Username + Logout (Fixed) */}
//       <div className="flex flex-col items-center px-4 py-4 border-t border-teal-400">
//         <span className="font-semibold text-base">{username}</span>
//         <button
//           onClick={onLogout}
//           className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-base font-medium text-white transition mt-2 w-full"
//         >
//           Logout
//         </button>
//       </div>
//     </nav>
//   );
// }