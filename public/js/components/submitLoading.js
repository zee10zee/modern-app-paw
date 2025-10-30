
console.log('from loading')
function loading(command){
  return `
  <div class="btn-loader-container">
    <div class="ring-loader">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <span>${command}...</span>
  </div>
`;
}