import xrplLogo from '../assets/xrpl.svg';

export default function renderXrplLogo() {
    document.getElementById('heading_logo').innerHTML = `

    <img id="xrpl_logo" class="logo vanilla" alt="XRPL logo" src="${xrplLogo}" />
</a>
`;
}
