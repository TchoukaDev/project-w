export default function Logo({ size = "lg", onClick, canBeClicked }) {
  const sizeClasses = {
    sm: {
      imgHeight: "max-h-[80px]",
      imgWidth: "max-w-[80px]",
      text: "-ml-2 text-2xl",
    },
    md: {
      imgHeight: "max-h-[150px]",
      imgWidth: "max-w-[150px]",
      text: "-ml-5 text-4xl",
    },
    lg: {
      imgHeight: "max-h-[400px]",
      imgWidth: "max-w-[400px]",
      text: "-ml-15 text-7xl",
    },
  };

  const selected = sizeClasses[size] || sizeClasses.lg;

  return (
    <div
      onClick={onClick}
      className={`flex justify-center items-center ${
        canBeClicked && "cursor-pointer"
      }`}
    >
      <svg
        className={` ${selected.imgWidth} text-black transition-colors duration-300 dark:text-white ${selected.imgHeight}`}
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="512.000000pt"
        height="512.000000pt"
        viewBox="0 0 512.000000 512.000000"
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
          fill="currentColor"
          stroke="none"
        >
          <path
            d="M2700 4175 c-117 -23 -242 -85 -355 -175 -134 -107 -358 -354 -519
-573 -70 -96 -221 -323 -278 -419 -23 -39 -44 -66 -46 -60 -2 6 1 68 7 137 32
371 1 645 -90 786 -158 247 -535 267 -759 40 -181 -184 -274 -547 -287 -1126
-20 -874 183 -1538 538 -1762 105 -66 148 -77 309 -77 168 -1 232 15 342 86
188 121 294 290 622 983 73 156 184 368 217 416 16 23 16 18 12 -86 -10 -205
23 -427 88 -595 171 -444 632 -556 956 -232 97 97 151 187 351 587 268 537
392 753 695 1208 88 133 178 280 201 327 37 78 40 92 40 165 0 63 -5 90 -23
128 -60 124 -214 176 -385 132 -84 -22 -225 -98 -336 -180 -199 -149 -462
-420 -660 -680 -45 -60 -52 -66 -47 -39 16 83 29 299 23 382 -17 245 -78 405
-200 520 -64 61 -118 89 -205 108 -79 16 -125 16 -211 -1z"
          />
        </g>
      </svg>

      <span className={`${selected.text} font-bold italic !font-pompiere`}>
        aves
      </span>
    </div>
  );
}
