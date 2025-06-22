package com.thesis.interactive_learning.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Setter
@Getter
public class BulkCollectionUpdateRequest {

    private List<Long> documentIds;
    private Long collectionId;

    public BulkCollectionUpdateRequest() {}

    public BulkCollectionUpdateRequest(List<Long> documentIds, Long collectionId) {
        this.documentIds = documentIds;
        this.collectionId = collectionId;
    }

    @Override
    public String toString() {
        return "BulkCollectionUpdateRequest{" +
                "documentIds=" + documentIds +
                ", collectionId=" + collectionId +
                '}';
    }
}