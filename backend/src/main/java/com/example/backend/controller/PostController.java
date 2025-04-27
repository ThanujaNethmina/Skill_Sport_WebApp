package com.example.backend.controller;

import com.example.backend.dto.PostDTO;
import com.example.backend.model.Post;
import com.example.backend.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    // Create a post for the logged-in user
    @PostMapping
    public Post createPost(@RequestBody PostDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        dto.setUserEmail(userEmail);
        return postService.createPost(dto);
    }

    // Get all posts for the logged-in user
    @GetMapping("/byLoggedInUser")
    public List<PostDTO> getUserPostsByLoggedInUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return postService.getPostsByUserEmail(userEmail);
    }

    // Update a post
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable String id, @RequestBody PostDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        
        if (!postService.isPostOwnedByUser(id, userEmail)) {
            return ResponseEntity.status(403).build();
        }
        
        Post updatedPost = postService.updatePost(id, dto);
        return ResponseEntity.ok(updatedPost);
    }


}