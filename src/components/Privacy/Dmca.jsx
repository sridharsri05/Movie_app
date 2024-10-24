import React from "react";

const Dmca = () => {
  return (
    <>
      <div className="p-4 bg-gray-800 font-libre text-gray-400 mt-5 lg:mt-9 sm:p-6 lg:p-8 text-justify  ">
        <div className="p-6 rounded-lg shadow-lg bg-gray-900 sm:p-8 lg:p-10">
          <h1 className="text-xl sm:text-2xl  s:text-xl lg:text-3xl font-bold mb-4 text-white">
            DMCA
          </h1>
          <div className="bg-gray-700 h-px w-full mb-4"></div>
          <p className="text-sm   sm:text-base lg:text-lg mb-4  s:text-xs ">
            MovieNexus is an online service provider as defined in the Digital Millennium
            Copyright Act. We provide legal copyright owners with the ability to
            self-publish on the Internet by uploading, storing, and displaying various
            types of media. We do not actively monitor, screen, or otherwise review the
            media which is uploaded to our servers by users of the service.
          </p>
          <p className="text-sm sm:text-base lg:text-lg mb-4  s:text-xs ">
            We take copyright violation very seriously and will vigorously protect the
            rights of legal copyright owners. If you are the copyright owner of content
            which appears on the MovieNexus website and you did not authorize the use of
            the content, you must notify us in writing in order for us to identify the
            allegedly infringing content and take action.
          </p>
          <p className="text-sm sm:text-base lg:text-lg mb-4   s:text-xs  ">
            In order to facilitate the process, we have provided an online form for your
            use. We will be unable to take any action if you do not provide us with the
            required information, so please fill out all fields accurately and completely.
            Alternatively, you may make a written notice via e-mail, facsimile, or postal
            mail to our DMCA Agent as listed below.
            <br />
            Your written notice must include the following: Specific identification of the
            copyrighted work which you are alleging to have been infringed. If you are
            alleging infringement of multiple copyrighted works with a single
            notification, you must submit a representative list which specifically
            identifies each of the works that you allege are being infringed.
            <br />
            Specific identification of the location and description of the material that
            is claimed to be infringing or to be the subject of infringing activity with
            enough detailed information to permit us to locate the material. You should
            include the specific URL or URLs of the web pages where the allegedly
            infringing material is located. Information reasonably sufficient to allow us
            to contact the complaining party, which may include a name, address, telephone
            number, and electronic mail address at which the complaining party may be
            contacted.
            <br />A statement that the complaining party has a good faith belief that use
            of the material in the manner complained of is not authorized by the copyright
            owner, its agent, or the law. A statement that the information in the
            notification is accurate, and under penalty of perjury, that the complaining
            party is authorized to act on behalf of the owner of an exclusive right that
            is allegedly infringed.
          </p>
          <p className="text-sm sm:text-base lg:text-lg mb-4  s:text-xs ">
            Written notice should be sent here:{" "}
            <a
              href="mailto:contact@MovieNexus.com"
              className="text-blue-500 hover:underline"
            >
              Contact Us
            </a>
          </p>
          <p className="text-xs sm:text-sm lg:text-base  s:text-xs ">
            Please also note that under applicable law, 17 U.S.C. 512 (f), any person who
            knowingly materially misrepresents that material or activity is infringing may
            be subject to liability.
          </p>
        </div>
      </div>
    </>
  );
};

export default Dmca;
