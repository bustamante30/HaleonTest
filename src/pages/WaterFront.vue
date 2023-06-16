
<script setup>
import { onMounted } from "vue";
onMounted(() => {
  var iframe = document.createElement("iframe");
  iframe.onload = function () {
    //some custom settings
    this.width = screen.availWidth;
    this.height = screen.availHeight;
    this.passing = 0;
    this.frameBorder = "0";
    this.scrolling = "no";
    this.allowfullscreen = "true"

    var href = iframe.contentWindow.location.href;
    var origin = iframe.contentWindow.location.origin;
    var url = iframe.contentWindow.location.url;
    var path = iframe.contentWindow.location.pathname;

    console.log("href: ", href);
    console.log("origin: ", origin);
    console.log("path: ", path);
    console.log("url: ", url);
  };

  iframe.src = "https://sgseval.testdrive.workfront.com/login?nextURL=%2Fqs%2Flogin%3FnextURL%3D%252Fprojects%252Fall";

  document.body.appendChild(iframe);
});
</script>

