---
layout: default
title: Keycube Heatmap
---

<link rel="stylesheet" href="{{ site.baseurl }}/assets/css/main.css">

<div class="home-container">
    <div class="project-title">Keycube Heatmap</div>
</div>

<script>
    setTimeout(() => {
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = "{{ site.baseurl }}/dataviz";
        }, 1000); // Match this to the CSS transition duration
    }, 4000); // 4s delay + 1s fade = 5s total
</script>

