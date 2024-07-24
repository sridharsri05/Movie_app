import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="p-4 bg-gray-900 text-white">
      <div className="bg-gray-700 h-px w-full mb-4"></div>
      <div className="flex flex-col md:flex-row justify-center items-center text-center md:text-left mb-4 font-libre">
        <h1 className="text-lg font-bold mb-2 md:mb-0">MovieNexus</h1>
        <p className="text-sm text-gray-400 mx-4">
          DISCLAIMER: This site does not store any files on its server. All contents are
          provided by non-affiliated third parties. If you have any legal issues, please
          contact the appropriate media file owners or host sites.
        </p>
      </div>
      <div className="bg-gray-700 h-px w-full mb-4"></div>
      <div className="text-center text-sm text-gray-400 mb-4 font-libre">
        &copy; {currentYear} MovieNexus. All Rights Reserved.
      </div>
      <div className="flex justify-center">
        <ul className="flex flex-wrap justify-center space-x-4 text-sm">
          <li>
            <a href="#" className="hover:text-gray-300">
              Trending
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-300">
              Featured
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-300">
              Contact Us
            </a>
          </li>
          <li>
            <Link to="DMCA" className="hover:text-gray-300">
              DMCA
            </Link>
          </li>
          <li>
            <Link to={"PrivacyPolicy"} className="hover:text-gray-300">
              Privacy Policy
            </Link>
          </li>
          <li>
            <a href="#" className="hover:text-gray-300">
              TOP IMDb
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
