# Git Auto-Commit & Push Watcher Script
# This script monitors changes in the project directory and automatically commits and pushes them to GitHub.

# --- CONFIGURATION ---
$WatchPath = Resolve-Path "."
$DebounceMs = 5000 # Wait 5 seconds after the last file change before pushing, to group edits together.
$ExcludedPatterns = @(
    "node_modules",
    "\.git",
    "dist",
    "build",
    "\.gemini",
    "glorysimon\.db",
    "verify_backend\.js",
    "\.log"
)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Glory Simon Dashboard Git Auto-Commit Watcher" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Watching path: $WatchPath"
Write-Host "Debounce time: $($DebounceMs/1000) seconds"
Write-Host "Press Ctrl+C to stop the watcher." -ForegroundColor Yellow
Write-Host "============================================="

# Create a FileSystemWatcher
$Watcher = New-Object System.IO.FileSystemWatcher
$Watcher.Path = $WatchPath
$Watcher.IncludeSubdirectories = $true
$Watcher.EnableRaisingEvents = $true

# Track the last change time
$Global:LastChangeEventTime = [System.DateTime]::MinValue
$Global:ChangePending = $false

# Handler action
$Action = {
    $Path = $Event.SourceEventArgs.FullPath
    
    # Check if the path matches any excluded pattern
    $IsExcluded = $false
    foreach ($Pattern in $ExcludedPatterns) {
        if ($Path -match $Pattern) {
            $IsExcluded = $true
            break
        }
    }
    
    if (-not $IsExcluded) {
        $Global:LastChangeEventTime = [System.DateTime]::Now
        if (-not $Global:ChangePending) {
            $Global:ChangePending = $true
            Write-Host "Change detected in: $(Split-Path $Path -Leaf). Waiting for changes to settle..." -ForegroundColor DarkYellow
        }
    }
}

# Register events
$CreatedEvent = Register-ObjectEvent $Watcher "Created" -Action $Action
$ChangedEvent = Register-ObjectEvent $Watcher "Changed" -Action $Action
$DeletedEvent = Register-ObjectEvent $Watcher "Deleted" -Action $Action
$RenamedEvent = Register-ObjectEvent $Watcher "Renamed" -Action $Action

try {
    while ($true) {
        Start-Sleep -Milliseconds 500
        
        # If a change is pending and debounce time has passed since the last change
        if ($Global:ChangePending -and ([System.DateTime]::Now - $Global:LastChangeEventTime).TotalMilliseconds -gt $DebounceMs) {
            $Global:ChangePending = $false
            
            Write-Host "Settling time met. Initiating auto-commit..." -ForegroundColor Cyan
            
            # Check git status
            $Status = git status --short
            if ([string]::IsNullOrWhiteSpace($Status)) {
                Write-Host "No changes to commit." -ForegroundColor Gray
                continue
            }
            
            Write-Host "Changes detected:" -ForegroundColor Blue
            Write-Host $Status
            
            # Stage changes (excluding DB and node_modules by pattern/gitignore)
            git add --all
            
            # Commit changes
            $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            git commit -m "Auto-commit: changes saved at $Timestamp"
            
            # Push changes (which triggers Vercel deployment)
            Write-Host "Pushing to GitHub..." -ForegroundColor Blue
            git push
            
            Write-Host "Auto-commit and push completed at $Timestamp." -ForegroundColor Green
            Write-Host "---------------------------------------------"
        }
    }
}
finally {
    # Cleanup event subscriptions on exit
    Unregister-Event -SourceIdentifier $CreatedEvent.Name
    Unregister-Event -SourceIdentifier $ChangedEvent.Name
    Unregister-Event -SourceIdentifier $DeletedEvent.Name
    Unregister-Event -SourceIdentifier $RenamedEvent.Name
    $Watcher.Dispose()
    Write-Host "Watcher stopped and resources cleaned up." -ForegroundColor Yellow
}
