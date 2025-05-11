package com.example.backend.repository;
import com.example.backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public class NotificationRepository {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);
    void deleteByPostId(String postId);   
}
