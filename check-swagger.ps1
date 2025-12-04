$urls = @(
    @{Name="Gateway"; Port=3000},
    @{Name="User"; Port=3001},
    @{Name="Book"; Port=3002},
    @{Name="Order"; Port=3003},
    @{Name="Notification"; Port=3004}
)

foreach ($svc in $urls) {
    $url = "http://localhost:$($svc.Port)/api-docs"
    try {
        $r = Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 5
        Write-Output "$($svc.Name) ($($svc.Port)): $($r.StatusCode)"
    } catch {
        Write-Output "$($svc.Name) ($($svc.Port)): ERROR - $($_.Exception.Message)"
    }
}
