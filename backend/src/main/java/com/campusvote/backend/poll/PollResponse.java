package com.campusvote.backend.poll;

import java.time.LocalDateTime;
import java.util.List;

public class PollResponse {

    private Long id;
    private String question;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean active;
    private List<PollOptionResponse> options;

    public PollResponse() {
    }

    public PollResponse(
            Long id,
            String question,
            String description,
            LocalDateTime startDate,
            LocalDateTime endDate,
            boolean active,
            List<PollOptionResponse> options) {

        this.id = id;
        this.question = question;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.active = active;
        this.options = options;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<PollOptionResponse> getOptions() {
        return options;
    }

    public void setOptions(List<PollOptionResponse> options) {
        this.options = options;
    }
}