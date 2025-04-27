package com.example.backend.controller;

import com.example.backend.model.Status;
import com.example.backend.service.StatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/story")
public class StatusController {

    @Autowired
    private StatusService statusService;

    @PostMapping("/createStory")
    public ResponseEntity<String> createStory(@RequestParam("image") MultipartFile image,
                                              @RequestParam("userid") String userId,
                                              @RequestParam("description") String description,
                                              @RequestParam("uname") String uname
                                              ) {


        try {
            String uploadsDir = "status/";

            String fileName = image.getOriginalFilename();

            Status status = new Status(description, userId ,uname);

            Status createdStory = statusService.addStatus(status);

            String storyId = createdStory.getId();
            String filePath = uploadsDir + storyId + ".jpg";

            Path path = Paths.get(filePath);
            Files.write(path, image.getBytes());

            status.setImageUrl(filePath);
            statusService.updateStatus(status);

            return ResponseEntity.ok("Story created successfully");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error creating story: " + e.getMessage());
        }
    }

    @GetMapping("/getAllStatus")
    public ResponseEntity<List<Status>> getAllStatus() {
        List<Status> allStatus = statusService.getAllStatus();
        return ResponseEntity.ok(allStatus);
    }

    @PatchMapping("/updateStory")
    public ResponseEntity<?> updateStory(@RequestBody Map<String, String> requestBody) {
        String storyId = requestBody.get("id");

        try {
            Status status = statusService.getStatusById(storyId);
            if (status == null) {
                return ResponseEntity.status(404).body("Story not found");
            }


            String description = requestBody.get("description");
        
            status.setDescription(description);
            
            statusService.updateStatus(status);

            return ResponseEntity.ok("Story details updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        }
    }
    
}
