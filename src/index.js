import "materialize-css/dist/css/materialize.min.css";
import "./style/style.css";
import "materialize-css/dist/js/materialize.min";
import main from "./scripts/main";

main();

class imgCovid extends HTMLElement {
    connectedCallback() {
        this.src = this.getAttribute("src") || null;
        this.alt = this.getAttribute("alt") || null;
    
        this.innerHTML = `
            <img src="${this.src}"
                alt="${this.alt}" id="imgCovid" width="100px" class="responsive-img">
        `;
    }
}

customElements.define("img-covid", imgCovid);