const socket = io("http://localhost:5000");

const createBlankSpace = wordLength => {
    const eL = document.querySelector("#fillWord");

    for (let t=0;t<wordLength;++t) {
        let sp = document.createElement("span");
        sp.style.borderBottom = "1px solid black";
        sp.appendChild(document.createTextNode( 'A' ));
        sp.padding = "10px";

        eL.appendChild(sp);
        eL.appendChild( document.createTextNode( '\u00A0\u00A0\u00A0' ) );
    }
};

socket.on("guess", data => {
    console.log(data);
    createBlankSpace(data.word.length);
     
});
