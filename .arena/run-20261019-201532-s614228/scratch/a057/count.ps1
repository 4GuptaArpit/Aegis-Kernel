$content = Get-Content -Path 'E:\HACKATHON\NEBIUS X NVIDIA\.arena\run-20261019-201532-s614228\r0\a057.md' -Raw
$words = $content -split '\s+' | Where-Object { $_ -ne '' }
Write-Output $words.Count
