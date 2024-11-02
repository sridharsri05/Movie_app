// import React from "react";

// const PrivacyPolicy = () => {
//   return (
//     <>
//       <div className="  p-4 bg-gray-800 font-libre text-gray-400">
//         <div className=" p-6 rounded-lg shadow-lg">
//           <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
//           <div className="bg-gray-700 h-px w-full mb-4"></div>
//           <p className="mb-4">
//             Please read the following terms and conditions carefully and pay attention to
//             the fact that by entering this site you completely agree to its terms and
//             conditions. MovieNexus site reserves the right to change these terms and
//             conditions without any prior notice. To get the changes to check this policy
//             on a regular base.
//           </p>
//           <p className="mb-4">
//             This Site (MovieNexus) shall have no responsibilities or liabilities for the
//             content, data, opinions, statements, and links this site contains.
//           </p>
//           <p className="mb-4">
//             YOU HEREBY FURTHER AFFIRM AND WARRANT THAT YOU ARE CURRENTLY OVER THE AGE OF
//             EIGHTEEN (18) YEARS (TWENTY-ONE (21) IN PLACES WHERE EIGHTEEN (18) YEARS IS
//             NOT THE AGE OF MAJORITY) AND ARE CAPABLE OF LAWFULLY ENTERING INTO AND
//             EXECUTING THE TERMS OF THIS AGREEMENT.
//           </p>
//           <p className="mb-4">MovieNexus uses the right of “Free Speech”.</p>
//           <p className="mb-4">
//             This site (MovieNexus) works in accordance with copyright law. Persons who
//             reproduce or distribute any works without a copyright owner’s consent may be
//             in violation of this law.
//           </p>
//           <p className="mb-4">
//             We do not make warranties that this site will operate error-free. If you see
//             an error, please contact the webmaster.
//           </p>
//           <p className="mb-4">
//             By entering this site you agree to hold the owners, employees, advertisers of
//             MovieNexus free from any and all liability.
//           </p>
//           <p className="mb-4">This site (MovieNexus) does not offer any membership.</p>
//           <p>
//             If you have any questions please feel free to{" "}
//             <a
//               href="mailto:contact@movienexus.com"
//               className="text-blue-500 hover:underline"
//             >
//               contact us
//             </a>
//           </p>
//         </div>
//       </div>
//     </>
//   );
// };

// export default PrivacyPolicy;

import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="p-4 bg-gray-800 font-libre text-gray-400 mt-5 lg:mt-9 sm:p-6 lg:p-8 text-justify">
      <div className="p-6 rounded-lg shadow-lg bg-gray-900 sm:p-8 lg:p-10">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 text-white">
          Privacy Policy
        </h1>
        <div className="bg-gray-700 h-px w-full mb-4"></div>

        <p className="text-sm sm:text-base lg:text-lg mb-4">
          Please read the following terms and conditions carefully and pay attention to
          the fact that by entering this site you completely agree to its terms and
          conditions. MovieNexus reserves the right to change these terms and conditions
          without prior notice. To get updates, check this policy regularly.
        </p>

        <p className="text-sm sm:text-base lg:text-lg mb-4">
          This Site (MovieNexus) shall have no responsibilities or liabilities for the
          content, data, opinions, statements, and links this site contains.
        </p>

        <p className="text-sm sm:text-base lg:text-lg mb-4">
          YOU HEREBY FURTHER AFFIRM AND WARRANT THAT YOU ARE CURRENTLY OVER THE AGE OF
          EIGHTEEN (18) YEARS (TWENTY-ONE (21) IN PLACES WHERE EIGHTEEN (18) YEARS IS NOT
          THE AGE OF MAJORITY) AND ARE CAPABLE OF LAWFULLY ENTERING INTO AND EXECUTING THE
          TERMS OF THIS AGREEMENT.
        </p>

        <p className="text-sm sm:text-base lg:text-lg mb-4">
          MovieNexus uses the right of “Free Speech”.
        </p>

        <p className="text-sm sm:text-base lg:text-lg mb-4">
          This site (MovieNexus) operates in accordance with copyright law. Persons who
          reproduce or distribute any works without a copyright owner’s consent may be in
          violation of this law.
        </p>

        <p className="text-sm sm:text-base lg:text-lg mb-4">
          We do not guarantee that this site will operate error-free. If you see an error,
          please contact the webmaster.
        </p>

        <p className="text-sm sm:text-base lg:text-lg mb-4">
          By entering this site, you agree to hold the owners, employees, and advertisers
          of MovieNexus free from any and all liability.
        </p>

        <p className="text-sm sm:text-base lg:text-lg mb-4">
          This site (MovieNexus) does not offer any membership.
        </p>

        <p className="text-sm sm:text-base lg:text-lg mb-4">
          If you have any questions, please feel free to{" "}
          <a
            href="mailto:contact@movienexus.com"
            className="text-blue-500 hover:underline"
          >
            contact us
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
